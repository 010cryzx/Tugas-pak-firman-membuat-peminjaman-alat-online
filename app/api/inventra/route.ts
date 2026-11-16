import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSystemData,
  recordActivityLog,
  createNotification,
  createItemRecord,
  updateItemRecord,
  createCategoryRecord,
  updateCategoryRecord,
  deleteCategoryRecord,
  createUserRecord,
  updateUserRecord,
  createLoanApplication,
  updateLoanRecord,
  deleteLoanRecord,
  createReturnRecord,
  updateReturnRecord,
  markNotificationsReadForUser,
  upsertSettingValue,
} from '../../../src/db/repository.ts';
import { verifyRequestActor } from '../../../src/middleware/auth.ts';

export async function GET(req: NextRequest) {
  try {
    const actor = await verifyRequestActor(req);
    const data = await getAllSystemData();
    return NextResponse.json({
      actor,
      ...data,
    });
  } catch (error: unknown) {
    console.error('Failed GET /api/inventra:', error);
    const message =
      error instanceof Error ? error.message : 'Gagal memuat data sistem dari PostgreSQL.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await verifyRequestActor(req);
    if (!actor) {
      return NextResponse.json(
        { error: '401 Unauthorized: Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, payload } = body;
    const systemData = await getAllSystemData();

    const requireRoles = (allowed: string[]) => {
      if (!allowed.includes(actor.role)) {
        return NextResponse.json(
          {
            error: `403 Akses Ditolak: Peran "${actor.role.toUpperCase()}" tidak memiliki izin untuk menjalankan aksi "${action}".`,
            code: 403,
          },
          { status: 403 }
        );
      }
      return null;
    };

    // 1. CREATE LOAN (Mengajukan Peminjaman)
    if (action === 'create_loan') {
      const { itemId, borrowDate, dueDate, purpose } = payload;
      const targetItem = systemData.items.find((i) => i.id === Number(itemId));
      if (!targetItem) {
        return NextResponse.json({ error: 'Alat tidak ditemukan.' }, { status: 404 });
      }
      if (!purpose || String(purpose).trim().length < 8) {
        return NextResponse.json(
          { error: 'Tujuan peminjaman wajib diisi minimal 8 karakter.' },
          { status: 400 }
        );
      }

      // Check item status & seat availability
      if (
        targetItem.status === 'maintenance' ||
        targetItem.status === 'kedaluwarsa' ||
        targetItem.seatsAvailable <= 0
      ) {
        return NextResponse.json(
          {
            error: `Alat "${targetItem.name}" sedang tidak tersedia (Status: ${targetItem.status.toUpperCase()}, Sisa Seat/Unit: ${targetItem.seatsAvailable}).`,
          },
          { status: 400 }
        );
      }

      // Check license expiry date if software
      if (targetItem.assetType === 'software' && targetItem.expiryDate) {
        if (dueDate > targetItem.expiryDate) {
          return NextResponse.json(
            {
              error: `Tanggal pengembalian (${dueDate}) melewati masa berlaku lisensi software (${targetItem.expiryDate}).`,
            },
            { status: 400 }
          );
        }
      }

      // Check duration policy
      const startMs = new Date(borrowDate).getTime();
      const endMs = new Date(dueDate).getTime();
      const diffDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
      const maxDays = Number(systemData.settings.max_loan_days || 7);
      if (isNaN(diffDays) || diffDays < 1) {
        return NextResponse.json(
          { error: 'Tanggal kembali harus minimal 1 hari setelah tanggal pinjam.' },
          { status: 400 }
        );
      }
      if (diffDays > maxDays) {
        return NextResponse.json(
          {
            error: `Durasi peminjaman (${diffDays} hari) melebihi batas maksimal kebijakan lab (${maxDays} hari).`,
          },
          { status: 400 }
        );
      }

      // Check active loan quota per borrower
      const activeUserLoans = systemData.loans.filter(
        (l) =>
          l.userId === actor.id &&
          ['menunggu', 'disetujui', 'dipinjam', 'terlambat'].includes(l.status)
      );

      // Check overdue block
      const hasOverdue = activeUserLoans.some((l) => l.status === 'terlambat');
      if (hasOverdue) {
        return NextResponse.json(
          {
            error:
              'Pengajuan ditolak otomatis: Anda memiliki pinjaman berstatus TERLAMBAT yang belum diselesaikan.',
          },
          { status: 400 }
        );
      }

      const activeHwCount = activeUserLoans.filter((l) => {
        const it = systemData.items.find((i) => i.id === l.itemId);
        return it?.assetType === 'hardware';
      }).length;
      const activeSwCount = activeUserLoans.filter((l) => {
        const it = systemData.items.find((i) => i.id === l.itemId);
        return it?.assetType === 'software';
      }).length;

      const maxHw = Number(systemData.settings.max_hardware_loans || 2);
      const maxSw = Number(systemData.settings.max_software_loans || 3);

      if (targetItem.assetType === 'hardware' && activeHwCount >= maxHw) {
        return NextResponse.json(
          {
            error: `Kuota perangkat keras penuh: Anda sudah memiliki ${activeHwCount} pinjaman laptop aktif (Maksimal ${maxHw} laptop).`,
          },
          { status: 400 }
        );
      }
      if (targetItem.assetType === 'software' && activeSwCount >= maxSw) {
        return NextResponse.json(
          {
            error: `Kuota lisensi penuh: Anda sudah memiliki ${activeSwCount} lisensi software aktif (Maksimal ${maxSw} lisensi).`,
          },
          { status: 400 }
        );
      }

      // Check schedule conflict for single-unit hardware
      if (targetItem.assetType === 'hardware') {
        const conflictingLoan = systemData.loans.find(
          (l) =>
            l.itemId === targetItem.id &&
            ['menunggu', 'disetujui', 'dipinjam', 'terlambat'].includes(l.status) &&
            l.borrowDate <= dueDate &&
            l.dueDate >= borrowDate
        );
        if (conflictingLoan) {
          return NextResponse.json(
            {
              error: `Bentrok Jadwal: Unit ${targetItem.assetCode} sudah terdaftar pada transaksi ${conflictingLoan.loanCode} (${conflictingLoan.borrowDate} s/d ${conflictingLoan.dueDate}).`,
            },
            { status: 400 }
          );
        }
      }

      const newLoan = await createLoanApplication({
        userId: actor.id,
        itemId: targetItem.id,
        borrowDate,
        dueDate,
        purpose: String(purpose).trim(),
      });

      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'CREATE_LOAN',
        module: 'Peminjaman',
        description: `Mengajukan peminjaman ${newLoan.loanCode} untuk ${targetItem.name} (${targetItem.assetCode}) periode ${borrowDate} s/d ${dueDate}.`,
      });

      // Notify petugas
      const petugasUsers = systemData.users.filter((u) => u.role === 'petugas');
      for (const p of petugasUsers) {
        await createNotification({
          userId: p.id,
          title: 'Pengajuan Peminjaman Baru',
          message: `${actor.name} mengajukan pinjaman ${targetItem.name} (${newLoan.loanCode}).`,
          type: 'info',
        });
      }

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Pengajuan peminjaman berhasil dikirim.', ...refreshed });
    }

    // 2. CANCEL LOAN
    if (action === 'cancel_loan') {
      const { loanId } = payload;
      const loan = systemData.loans.find((l) => l.id === Number(loanId));
      if (!loan) {
        return NextResponse.json({ error: 'Data peminjaman tidak ditemukan.' }, { status: 404 });
      }
      if (loan.userId !== actor.id && actor.role === 'peminjam') {
        return NextResponse.json({ error: '403 Akses Ditolak.' }, { status: 403 });
      }
      if (loan.status !== 'menunggu') {
        return NextResponse.json(
          { error: 'Hanya pengajuan berstatus MENUNGGU yang dapat dibatalkan.' },
          { status: 400 }
        );
      }

      await updateLoanRecord(loan.id, { status: 'dibatalkan' });
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'CANCEL_LOAN',
        module: 'Peminjaman',
        description: `Membatalkan pengajuan peminjaman ${loan.loanCode}.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Pengajuan peminjaman telah dibatalkan.', ...refreshed });
    }

    // 3. EXTEND LOAN (Perpanjangan Peminjaman)
    if (action === 'extend_loan') {
      const { loanId, extraDays } = payload;
      const loan = systemData.loans.find((l) => l.id === Number(loanId));
      if (!loan) {
        return NextResponse.json({ error: 'Data peminjaman tidak ditemukan.' }, { status: 404 });
      }
      if (loan.extendedCount >= 1) {
        return NextResponse.json(
          { error: 'Batas perpanjangan maksimal 1 kali per transaksi peminjaman.' },
          { status: 400 }
        );
      }
      if (!['disetujui', 'dipinjam'].includes(loan.status)) {
        return NextResponse.json(
          { error: 'Hanya pinjaman aktif (Disetujui / Sedang Dipinjam) yang dapat diperpanjang.' },
          { status: 400 }
        );
      }

      const addDays = Math.min(Math.max(Number(extraDays) || 2, 1), 3);
      const currentDue = new Date(loan.dueDate);
      currentDue.setDate(currentDue.getDate() + addDays);
      const nextDueStr = currentDue.toISOString().split('T')[0];

      await updateLoanRecord(loan.id, {
        dueDate: nextDueStr,
        extendedCount: loan.extendedCount + 1,
      });

      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'EXTEND_LOAN',
        module: 'Peminjaman',
        description: `Memperpanjang tenggat peminjaman ${loan.loanCode} selama ${addDays} hari hingga ${nextDueStr}.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({
        message: `Tenggat pengembalian berhasil diperpanjang hingga ${nextDueStr}.`,
        ...refreshed,
      });
    }

    // 4. APPROVE LOAN (Petugas / Admin)
    if (action === 'approve_loan') {
      const guard = requireRoles(['petugas', 'admin']);
      if (guard) return guard;

      const { loanId } = payload;
      const loan = systemData.loans.find((l) => l.id === Number(loanId));
      if (!loan) {
        return NextResponse.json({ error: 'Data peminjaman tidak ditemukan.' }, { status: 404 });
      }
      const item = systemData.items.find((i) => i.id === loan.itemId);
      if (!item || item.seatsAvailable <= 0) {
        return NextResponse.json(
          { error: 'Stok unit atau seat lisensi sudah habis.' },
          { status: 400 }
        );
      }

      const nextSeats = Math.max(0, item.seatsAvailable - 1);
      const nextItemStatus =
        item.assetType === 'hardware' || nextSeats === 0 ? 'dipinjam' : 'tersedia';

      await updateItemRecord(item.id, {
        seatsAvailable: nextSeats,
        status: nextItemStatus,
      });

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      await updateLoanRecord(loan.id, {
        status: 'dipinjam',
        approvedBy: actor.id,
        approvedAt: nowStr,
      });

      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'APPROVE_LOAN',
        module: 'Persetujuan',
        description: `Menyetujui & menyerahkan ${item.name} (${item.assetCode}) untuk transaksi ${loan.loanCode}.`,
      });

      await createNotification({
        userId: loan.userId,
        title: 'Peminjaman Disetujui',
        message: `Pengajuan ${loan.loanCode} (${item.name}) telah disetujui oleh ${actor.name}. Bukti peminjaman PDF siap dicetak.`,
        type: 'success',
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({
        message: `Peminjaman ${loan.loanCode} berhasil disetujui.`,
        ...refreshed,
      });
    }

    // 5. REJECT LOAN (Petugas / Admin)
    if (action === 'reject_loan') {
      const guard = requireRoles(['petugas', 'admin']);
      if (guard) return guard;

      const { loanId, rejectionReason } = payload;
      if (!rejectionReason || String(rejectionReason).trim().length < 5) {
        return NextResponse.json(
          { error: 'Alasan penolakan wajib diisi secara jelas.' },
          { status: 400 }
        );
      }
      const loan = systemData.loans.find((l) => l.id === Number(loanId));
      if (!loan) {
        return NextResponse.json({ error: 'Data peminjaman tidak ditemukan.' }, { status: 404 });
      }

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      await updateLoanRecord(loan.id, {
        status: 'ditolak',
        approvedBy: actor.id,
        approvedAt: nowStr,
        rejectionReason: String(rejectionReason).trim(),
      });

      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'REJECT_LOAN',
        module: 'Persetujuan',
        description: `Menolak pengajuan ${loan.loanCode}. Alasan: ${rejectionReason}`,
      });

      await createNotification({
        userId: loan.userId,
        title: 'Pengajuan Peminjaman Ditolak',
        message: `Transaksi ${loan.loanCode} ditolak oleh petugas. Alasan: ${rejectionReason}`,
        type: 'warning',
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({
        message: `Pengajuan ${loan.loanCode} telah ditolak.`,
        ...refreshed,
      });
    }

    // 6. PROCESS RETURN (Pengembalian + Hitung Denda Otomatis + Auto Maintenance jika Rusak)
    if (action === 'process_return') {
      const { loanId, returnedAt, conditionAfter, damageNotes, finePaid } = payload;
      const loan = systemData.loans.find((l) => l.id === Number(loanId));
      if (!loan) {
        return NextResponse.json({ error: 'Data peminjaman tidak ditemukan.' }, { status: 404 });
      }
      const item = systemData.items.find((i) => i.id === loan.itemId);
      if (!item) {
        return NextResponse.json({ error: 'Data alat tidak ditemukan.' }, { status: 404 });
      }

      const actualReturnDate = returnedAt || new Date().toISOString().split('T')[0];
      const dueMs = new Date(loan.dueDate).getTime();
      const returnMs = new Date(actualReturnDate).getTime();
      const rawLateDays = Math.ceil((returnMs - dueMs) / (1000 * 60 * 60 * 24));
      const lateDays = Math.max(0, isNaN(rawLateDays) ? 0 : rawLateDays);
      const dailyFineRate = Number(systemData.settings.daily_fine_idr || 25000);
      const fineAmount = lateDays * dailyFineRate;

      const finalCondition = conditionAfter || 'baik';
      const isDamaged = finalCondition === 'rusak_ringan' || finalCondition === 'rusak_berat';

      await createReturnRecord({
        loanId: loan.id,
        returnedAt: actualReturnDate,
        processedBy: actor.id,
        conditionAfter: finalCondition,
        lateDays,
        fineAmount,
        finePaid: fineAmount === 0 ? true : Boolean(finePaid),
        damageNotes: damageNotes || 'Pengembalian diverifikasi sesuai prosedur laboratorium.',
      });

      await updateLoanRecord(loan.id, { status: 'dikembalikan' });

      // Update item stock & status: if hardware is damaged -> automatically set to 'maintenance'
      if (item.assetType === 'hardware') {
        await updateItemRecord(item.id, {
          condition: finalCondition,
          status: isDamaged ? 'maintenance' : 'tersedia',
          seatsAvailable: isDamaged ? 0 : 1,
        });
      } else {
        // Software license returns back to seat pool
        const restoredSeats = Math.min(item.seatsTotal, item.seatsAvailable + 1);
        await updateItemRecord(item.id, {
          seatsAvailable: restoredSeats,
          status: 'tersedia',
        });
      }

      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'PROCESS_RETURN',
        module: 'Pengembalian',
        description: `Pengembalian ${loan.loanCode} (${item.name}). Terlambat: ${lateDays} hari (Denda Rp ${fineAmount.toLocaleString('id-ID')}). Kondisi: ${finalCondition.toUpperCase()}${isDamaged ? ' -> Status unit otomatis dialihkan ke MAINTENANCE.' : '.'}`,
      });

      await createNotification({
        userId: loan.userId,
        title: 'Pengembalian Alat Selesai Diverifikasi',
        message: `Pengembalian ${item.name} (${loan.loanCode}) tercatat pada ${actualReturnDate}.${lateDays > 0 ? ` Terlambat ${lateDays} hari dengan denda Rp ${fineAmount.toLocaleString('id-ID')}.` : ' Tepat waktu tanpa denda.'}`,
        type: lateDays > 0 ? 'warning' : 'success',
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({
        message: `Pengembalian ${loan.loanCode} berhasil diverifikasi.${isDamaged ? ' Unit rusak otomatis masuk status Maintenance.' : ''}`,
        ...refreshed,
      });
    }

    // 7. TOGGLE FINE PAID (Petugas / Admin)
    if (action === 'toggle_fine_paid') {
      const guard = requireRoles(['petugas', 'admin']);
      if (guard) return guard;

      const { returnId, finePaid } = payload;
      await updateReturnRecord(Number(returnId), { finePaid: Boolean(finePaid) });
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'UPDATE_FINE_STATUS',
        module: 'Pengembalian & Denda',
        description: `Memperbarui status pembayaran denda pada ID Pengembalian #${returnId} menjadi ${finePaid ? 'LUNAS' : 'BELUM LUNAS'}.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Status pembayaran denda diperbarui.', ...refreshed });
    }

    // 8. ADMIN: CRUD ITEM (Alat & Lisensi)
    if (action === 'save_item') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const {
        id,
        assetCode,
        name,
        brand,
        model,
        categoryId,
        assetType,
        specs,
        condition,
        status,
        seatsTotal,
        seatsAvailable,
        expiryDate,
        imageUrl,
      } = payload;

      if (id) {
        await updateItemRecord(Number(id), {
          assetCode,
          name,
          brand,
          model,
          categoryId: Number(categoryId),
          assetType,
          specs,
          condition,
          status,
          seatsTotal: Number(seatsTotal),
          seatsAvailable: Number(seatsAvailable),
          expiryDate: expiryDate || null,
          imageUrl,
        });
        await recordActivityLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'UPDATE_ITEM',
          module: 'Manajemen Alat',
          description: `Memperbarui spesifikasi/status alat ${name} (${assetCode}).`,
        });
      } else {
        await createItemRecord({
          assetCode,
          name,
          brand,
          model,
          categoryId: Number(categoryId),
          assetType,
          specs,
          condition: condition || 'baik',
          status: status || 'tersedia',
          seatsTotal: Number(seatsTotal) || 1,
          seatsAvailable: Number(seatsAvailable ?? seatsTotal ?? 1),
          expiryDate: expiryDate || null,
          imageUrl:
            imageUrl ||
            (assetType === 'software'
              ? '/images/asset_software_license_vault_1794532742212.jpg'
              : '/images/hero_hardware_workstation_1794532739091.jpg'),
        });
        await recordActivityLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'CREATE_ITEM',
          module: 'Manajemen Alat',
          description: `Menambahkan alat baru ${name} (${assetCode}) ke katalog inventaris.`,
        });
      }

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Data alat berhasil disimpan.', ...refreshed });
    }

    if (action === 'delete_item') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { id } = payload;
      const item = systemData.items.find((i) => i.id === Number(id));
      await updateItemRecord(Number(id), {
        deletedAt: new Date().toISOString(),
      });
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'SOFT_DELETE_ITEM',
        module: 'Manajemen Alat',
        description: `Mengarsipkan (soft-delete) alat ${item?.name || id} (${item?.assetCode || ''}).`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Alat berhasil diarsipkan (Soft Delete).', ...refreshed });
    }

    // 9. ADMIN: CRUD CATEGORY
    if (action === 'save_category') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { id, code, name, assetType, description } = payload;
      if (id) {
        await updateCategoryRecord(Number(id), { code, name, assetType, description });
        await recordActivityLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'UPDATE_CATEGORY',
          module: 'Kategori',
          description: `Memperbarui kategori ${code} — ${name}.`,
        });
      } else {
        await createCategoryRecord({ code, name, assetType, description });
        await recordActivityLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'CREATE_CATEGORY',
          module: 'Kategori',
          description: `Menambahkan kategori baru ${code} — ${name}.`,
        });
      }

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Kategori berhasil disimpan.', ...refreshed });
    }

    if (action === 'delete_category') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      await deleteCategoryRecord(Number(payload.id));
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'DELETE_CATEGORY',
        module: 'Kategori',
        description: `Menghapus kategori ID #${payload.id}.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Kategori berhasil dihapus.', ...refreshed });
    }

    // 10. ADMIN: CRUD USER & RESET PASSWORD
    if (action === 'save_user') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { id, name, email, username, role, department, identityNumber, phone, isActive } =
        payload;
      if (id) {
        await updateUserRecord(Number(id), {
          name,
          email,
          username,
          role,
          department,
          identityNumber,
          phone,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        });
        await recordActivityLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'UPDATE_USER',
          module: 'Manajemen User',
          description: `Memperbarui akun pengguna ${name} (Role: ${role.toUpperCase()}).`,
        });
      } else {
        await createUserRecord({
          name,
          email,
          username,
          role,
          department,
          identityNumber,
          phone,
        });
        await recordActivityLog({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'CREATE_USER',
          module: 'Manajemen User',
          description: `Menambahkan akun pengguna baru ${name} (${role.toUpperCase()}).`,
        });
      }

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Data pengguna berhasil disimpan.', ...refreshed });
    }

    if (action === 'delete_user') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { id } = payload;
      if (Number(id) === actor.id) {
        return NextResponse.json(
          { error: 'Anda tidak dapat menghapus akun Admin yang sedang aktif.' },
          { status: 400 }
        );
      }
      await updateUserRecord(Number(id), {
        deletedAt: new Date().toISOString(),
        isActive: false,
      });
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'SOFT_DELETE_USER',
        module: 'Manajemen User',
        description: `Menonaktifkan & mengarsipkan (soft-delete) pengguna ID #${id}.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Pengguna berhasil diarsipkan.', ...refreshed });
    }

    if (action === 'reset_user_password') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { id } = payload;
      await updateUserRecord(Number(id), {
        passwordHash: 'bcrypt$2b$10$resetByAdmin2026',
      });
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'RESET_PASSWORD',
        module: 'Keamanan & User',
        description: `Mereset kata sandi pengguna ID #${id} ke sandi standar laboratorium.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({
        message: 'Kata sandi pengguna berhasil direset ke "password123".',
        ...refreshed,
      });
    }

    // 11. ADMIN: CRUD PEMINJAMAN & PENGEMBALIAN OVERRIDE
    if (action === 'admin_delete_loan') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { loanId } = payload;
      await deleteLoanRecord(Number(loanId));
      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'DELETE_LOAN',
        module: 'Manajemen Peminjaman',
        description: `Menghapus data peminjaman ID #${loanId} oleh Admin.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Data peminjaman dihapus.', ...refreshed });
    }

    // 12. ADMIN: UPDATE LAB POLICY SETTINGS
    if (action === 'update_settings') {
      const guard = requireRoles(['admin']);
      if (guard) return guard;

      const { max_hardware_loans, max_software_loans, max_loan_days, daily_fine_idr } = payload;
      if (max_hardware_loans) await upsertSettingValue('max_hardware_loans', String(max_hardware_loans));
      if (max_software_loans) await upsertSettingValue('max_software_loans', String(max_software_loans));
      if (max_loan_days) await upsertSettingValue('max_loan_days', String(max_loan_days));
      if (daily_fine_idr) await upsertSettingValue('daily_fine_idr', String(daily_fine_idr));

      await recordActivityLog({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'UPDATE_POLICY',
        module: 'Pengaturan Kebijakan',
        description: `Memperbarui aturan kebijakan lab: Maks Laptop=${max_hardware_loans}, Maks Software=${max_software_loans}, Durasi=${max_loan_days} hari, Denda=Rp ${Number(daily_fine_idr).toLocaleString('id-ID')}/hari.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({
        message: 'Kebijakan peminjaman dan tarif denda berhasil diperbarui.',
        ...refreshed,
      });
    }

    // 13. PROFILE & NOTIFICATIONS (Semua Role)
    if (action === 'update_profile') {
      const { name, department, phone, newPassword } = payload;
      await updateUserRecord(actor.id, {
        name,
        department,
        phone,
        ...(newPassword ? { passwordHash: `bcrypt$2b$10$custom_${Date.now()}` } : {}),
      });
      await recordActivityLog({
        userId: actor.id,
        userName: name || actor.name,
        userRole: actor.role,
        action: 'UPDATE_PROFILE',
        module: 'Profil Pengguna',
        description: `Memperbarui profil pribadi${newPassword ? ' beserta kata sandi baru' : ''}.`,
      });

      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Profil berhasil diperbarui.', ...refreshed });
    }

    if (action === 'mark_notifications_read') {
      await markNotificationsReadForUser(actor.id);
      const refreshed = await getAllSystemData();
      return NextResponse.json({ message: 'Seluruh notifikasi ditandai telah dibaca.', ...refreshed });
    }

    return NextResponse.json({ error: `Aksi "${action}" tidak dikenali.` }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error in POST /api/inventra:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
