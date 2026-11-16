import { eq, desc, isNull } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  categories,
  items,
  loans,
  returns,
  activityLogs,
  notifications,
  settings,
  HardwareSpecs,
  SoftwareSpecs,
} from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const cleanName = displayName || email.split('@')[0] || 'Pengguna Lab';
    const cleanUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
    const result = await db
      .insert(users)
      .values({
        uid,
        name: cleanName,
        email,
        username: cleanUsername,
        passwordHash: 'firebase-oauth-verified',
        role: 'peminjam',
        department: 'Sivitas Akademika (SSO)',
        identityNumber: `SSO-${uid.slice(0, 6).toUpperCase()}`,
        phone: '-',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Gagal menyinkronkan profil pengguna ke database.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Gagal mengambil data pengguna.', { cause: error });
  }
}

export async function getUserByCredentials(identifier: string) {
  try {
    const allUsers = await db.select().from(users).where(isNull(users.deletedAt));
    const normalized = identifier.trim().toLowerCase();
    return (
      allUsers.find(
        (u) =>
          u.username.toLowerCase() === normalized ||
          u.email.toLowerCase() === normalized ||
          u.uid.toLowerCase() === normalized
      ) || null
    );
  } catch (error) {
    console.error('Database query failed in getUserByCredentials:', error);
    throw new Error('Gagal memverifikasi kredensial pengguna.', { cause: error });
  }
}

export async function getAllSystemData() {
  try {
    const [
      userList,
      categoryList,
      itemList,
      loanList,
      returnList,
      logList,
      notifList,
      settingList,
    ] = await Promise.all([
      db.select().from(users).orderBy(users.id),
      db.select().from(categories).orderBy(categories.id),
      db.select().from(items).orderBy(items.id),
      db.select().from(loans).orderBy(desc(loans.id)),
      db.select().from(returns).orderBy(desc(returns.id)),
      db.select().from(activityLogs).orderBy(desc(activityLogs.id)),
      db.select().from(notifications).orderBy(desc(notifications.id)),
      db.select().from(settings).orderBy(settings.id),
    ]);

    const activeUsers = userList.filter((u) => !u.deletedAt);
    const activeItems = itemList.filter((i) => !i.deletedAt);

    const settingsMap: Record<string, string> = {
      max_hardware_loans: '2',
      max_software_loans: '3',
      max_loan_days: '7',
      daily_fine_idr: '25000',
      lab_name: 'Laboratorium Komputasi & Sistem Terpadu INVENTRA',
    };
    for (const s of settingList) {
      settingsMap[s.key] = s.value;
    }

    return {
      users: activeUsers,
      allUsersIncludingDeleted: userList,
      categories: categoryList,
      items: activeItems,
      loans: loanList,
      returns: returnList,
      activityLogs: logList,
      notifications: notifList,
      settings: settingsMap,
    };
  } catch (error) {
    console.error('Database query failed in getAllSystemData:', error);
    throw new Error('Gagal memuat data inventaris dan peminjaman dari PostgreSQL.', {
      cause: error,
    });
  }
}

export async function recordActivityLog(params: {
  userId?: number | null;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
}) {
  try {
    await db.insert(activityLogs).values({
      userId: params.userId ?? null,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      module: params.module,
      description: params.description,
      ipAddress: params.ipAddress || '10.24.0.15',
    });
  } catch (error) {
    console.error('Failed to record activity log:', error);
  }
}

export async function createNotification(params: {
  userId: number;
  title: string;
  message: string;
  type?: string;
}) {
  try {
    await db.insert(notifications).values({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      isRead: false,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function createItemRecord(data: {
  assetCode: string;
  name: string;
  brand: string;
  model: string;
  categoryId: number;
  assetType: string;
  specs: HardwareSpecs & SoftwareSpecs;
  condition: string;
  status: string;
  seatsTotal: number;
  seatsAvailable: number;
  expiryDate: string | null;
  imageUrl: string;
}) {
  try {
    const qrPayload = `INVENTRA:${data.assetCode}:${data.model}`;
    const inserted = await db
      .insert(items)
      .values({
        assetCode: data.assetCode,
        name: data.name,
        brand: data.brand,
        model: data.model,
        categoryId: data.categoryId,
        assetType: data.assetType,
        specs: data.specs,
        condition: data.condition,
        status: data.status,
        seatsTotal: data.seatsTotal,
        seatsAvailable: data.seatsAvailable,
        expiryDate: data.expiryDate,
        imageUrl: data.imageUrl,
        qrPayload,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createItemRecord:', error);
    throw new Error('Gagal menambahkan data alat baru ke database.', { cause: error });
  }
}

export async function updateItemRecord(
  id: number,
  data: Partial<{
    assetCode: string;
    name: string;
    brand: string;
    model: string;
    categoryId: number;
    assetType: string;
    specs: HardwareSpecs & SoftwareSpecs;
    condition: string;
    status: string;
    seatsTotal: number;
    seatsAvailable: number;
    expiryDate: string | null;
    imageUrl: string;
    deletedAt: string | null;
  }>
) {
  try {
    const updated = await db
      .update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateItemRecord:', error);
    throw new Error('Gagal memperbarui data alat.', { cause: error });
  }
}

export async function createCategoryRecord(data: {
  code: string;
  name: string;
  assetType: string;
  description: string;
}) {
  try {
    const inserted = await db.insert(categories).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createCategoryRecord:', error);
    throw new Error('Gagal menambahkan kategori baru.', { cause: error });
  }
}

export async function updateCategoryRecord(
  id: number,
  data: Partial<{ code: string; name: string; assetType: string; description: string }>
) {
  try {
    const updated = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateCategoryRecord:', error);
    throw new Error('Gagal memperbarui kategori.', { cause: error });
  }
}

export async function deleteCategoryRecord(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (error) {
    console.error('Database query failed in deleteCategoryRecord:', error);
    throw new Error('Kategori tidak dapat dihapus karena masih memiliki alat terkait.', {
      cause: error,
    });
  }
}

export async function createUserRecord(data: {
  name: string;
  email: string;
  username: string;
  role: string;
  department: string;
  identityNumber: string;
  phone: string;
}) {
  try {
    const uid = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const inserted = await db
      .insert(users)
      .values({
        uid,
        name: data.name,
        email: data.email,
        username: data.username,
        passwordHash: 'bcrypt$2b$10$inventraDefaultPass',
        role: data.role,
        department: data.department,
        identityNumber: data.identityNumber,
        phone: data.phone,
        isActive: true,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createUserRecord:', error);
    throw new Error('Gagal membuat akun pengguna baru.', { cause: error });
  }
}

export async function updateUserRecord(
  id: number,
  data: Partial<{
    name: string;
    email: string;
    username: string;
    role: string;
    department: string;
    identityNumber: string;
    phone: string;
    isActive: boolean;
    passwordHash: string;
    deletedAt: string | null;
  }>
) {
  try {
    const updated = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateUserRecord:', error);
    throw new Error('Gagal memperbarui data pengguna.', { cause: error });
  }
}

export async function createLoanApplication(data: {
  userId: number;
  itemId: number;
  borrowDate: string;
  dueDate: string;
  purpose: string;
}) {
  try {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const loanCode = `INV-202611-${randomSuffix}`;
    const inserted = await db
      .insert(loans)
      .values({
        loanCode,
        userId: data.userId,
        itemId: data.itemId,
        borrowDate: data.borrowDate,
        dueDate: data.dueDate,
        purpose: data.purpose,
        status: 'menunggu',
        extendedCount: 0,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createLoanApplication:', error);
    throw new Error('Gagal menyimpan pengajuan peminjaman.', { cause: error });
  }
}

export async function updateLoanRecord(
  id: number,
  data: Partial<{
    status: string;
    dueDate: string;
    purpose: string;
    approvedBy: number | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    extendedCount: number;
  }>
) {
  try {
    const updated = await db
      .update(loans)
      .set(data)
      .where(eq(loans.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateLoanRecord:', error);
    throw new Error('Gagal memperbarui status peminjaman.', { cause: error });
  }
}

export async function deleteLoanRecord(id: number) {
  try {
    await db.delete(returns).where(eq(returns.loanId, id));
    await db.delete(loans).where(eq(loans.id, id));
  } catch (error) {
    console.error('Database query failed in deleteLoanRecord:', error);
    throw new Error('Gagal menghapus data peminjaman.', { cause: error });
  }
}

export async function createReturnRecord(data: {
  loanId: number;
  returnedAt: string;
  processedBy: number;
  conditionAfter: string;
  lateDays: number;
  fineAmount: number;
  finePaid: boolean;
  damageNotes: string;
}) {
  try {
    const inserted = await db.insert(returns).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createReturnRecord:', error);
    throw new Error('Gagal menyimpan data pengembalian.', { cause: error });
  }
}

export async function updateReturnRecord(
  id: number,
  data: Partial<{
    conditionAfter: string;
    lateDays: number;
    fineAmount: number;
    finePaid: boolean;
    damageNotes: string;
  }>
) {
  try {
    const updated = await db
      .update(returns)
      .set(data)
      .where(eq(returns.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateReturnRecord:', error);
    throw new Error('Gagal memperbarui data pengembalian.', { cause: error });
  }
}

export async function markNotificationsReadForUser(userId: number) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  } catch (error) {
    console.error('Database query failed in markNotificationsReadForUser:', error);
    throw new Error('Gagal memperbarui status notifikasi.', { cause: error });
  }
}

export async function upsertSettingValue(key: string, value: string) {
  try {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value },
      });
  } catch (error) {
    console.error('Database query failed in upsertSettingValue:', error);
    throw new Error('Gagal memperbarui pengaturan kebijakan lab.', { cause: error });
  }
}
