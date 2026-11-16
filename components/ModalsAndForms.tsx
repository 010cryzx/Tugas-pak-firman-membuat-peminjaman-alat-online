'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Laptop,
  KeyRound,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  FileText,
  Printer,
} from 'lucide-react';
import {
  AssetItem,
  CategoryItem,
  LoanItem,
  SystemSettings,
  formatRupiah,
  getDaysUntil,
  getItemStatusLabel,
} from './types';
import { QrCodeSvg } from './QrCodeMatrix';

export function AssetDetailModal({
  item,
  category,
  itemLoans,
  onClose,
  onBorrowClick,
}: {
  item: AssetItem;
  category?: CategoryItem;
  itemLoans: LoanItem[];
  onClose: () => void;
  onBorrowClick: (item: AssetItem) => void;
}) {
  const statusInfo = getItemStatusLabel(item.status);
  const daysToExpiry = getDaysUntil(item.expiryDate);
  const activeSchedule = itemLoans.filter((l) =>
    ['menunggu', 'disetujui', 'dipinjam', 'terlambat'].includes(l.status)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#38BDF8] tabular-nums">
              {item.assetCode}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-[#94A3B8]">{category?.name || 'Aset Lab'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Visual & QR Tag */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-4/3 w-full bg-[#090D16] border border-[#1E293B] rounded overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>

            <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-[#94A3B8]">LABEL QR ASET</div>
                <div className="font-mono text-xs text-white font-semibold tabular-nums">
                  {item.assetCode}
                </div>
                <div className="text-[11px] font-mono text-slate-400 break-all">
                  {item.qrPayload}
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:underline pt-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  Cetak Label QR
                </button>
              </div>
              <QrCodeSvg value={item.qrPayload} size={76} />
            </div>
          </div>

          {/* Right Column: Technical Specs & Schedule */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 text-xs font-mono border rounded ${statusInfo.colorClass}`}
                >
                  {statusInfo.label}
                </span>
                <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
                  Kondisi: {item.condition.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{item.name}</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                {item.brand} · Model {item.model} ·{' '}
                {item.assetType === 'hardware' ? 'Unit Perangkat Keras' : 'Lisensi Perangkat Lunak'}
              </p>
            </div>

            {/* Capacity / Availability Bar */}
            <div className="p-3.5 bg-[#090D16] border border-[#1E293B] rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">
                  {item.assetType === 'hardware' ? 'Ketersediaan Unit Fisik' : 'Ketersediaan Kuota Seat Lisensi'}
                </span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {item.seatsAvailable} / {item.seatsTotal}{' '}
                  {item.assetType === 'hardware' ? 'Unit' : 'Seat'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3B82F6] transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((item.seatsAvailable / Math.max(1, item.seatsTotal)) * 100))}%`,
                  }}
                />
              </div>
              {item.assetType === 'software' && item.expiryDate && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#94A3B8]">Masa Berlaku Lisensi</span>
                  <span
                    className={`font-mono tabular-nums ${
                      daysToExpiry !== null && daysToExpiry <= 30
                        ? 'text-amber-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.expiryDate}{' '}
                    {daysToExpiry !== null ? `(${daysToExpiry} hari lagi)` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* JSONB Technical Specs Matrix */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#94A3B8]">
                MATRIKS SPESIFIKASI TEKNIS (JSONB)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {item.assetType === 'hardware' ? (
                  <>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Prosesor (CPU)</div>
                      <div className="font-medium text-white mt-0.5">{item.specs.cpu || '-'}</div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Memori (RAM)</div>
                      <div className="font-mono text-white mt-0.5">{item.specs.ram || '-'}</div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Kartu Grafis (GPU)</div>
                      <div className="font-medium text-white mt-0.5">{item.specs.gpu || '-'}</div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Penyimpanan</div>
                      <div className="font-mono text-white mt-0.5">{item.specs.storage || '-'}</div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Sistem Operasi</div>
                      <div className="font-medium text-white mt-0.5">{item.specs.os || '-'}</div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Nomor Seri (S/N)</div>
                      <div className="font-mono text-[#38BDF8] mt-0.5 tabular-nums">
                        {item.specs.serialNumber || '-'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Versi Rilis</div>
                      <div className="font-mono text-white mt-0.5">{item.specs.version || '-'}</div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Tipe Lisensi</div>
                      <div className="font-medium text-white mt-0.5">
                        {item.specs.licenseType || '-'}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Platform Kompatibel</div>
                      <div className="font-medium text-white mt-0.5">
                        {item.specs.platform || '-'}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded">
                      <div className="text-[#94A3B8]">Mode Aktivasi</div>
                      <div className="font-mono text-[#38BDF8] mt-0.5">
                        {item.specs.activationMode || '-'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Schedule List */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-[#94A3B8]">
                JADWAL PEMINJAMAN AKTIF ({activeSchedule.length})
              </div>
              {activeSchedule.length === 0 ? (
                <div className="p-2.5 bg-[#090D16] border border-[#1E293B] rounded text-xs text-slate-400">
                  Tidak ada antrean jadwal bentrok. Unit siap diajukan.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {activeSchedule.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between px-3 py-2 bg-[#090D16] border border-[#1E293B] rounded text-xs"
                    >
                      <span className="font-mono text-slate-200 tabular-nums">{l.loanCode}</span>
                      <span className="font-mono text-[#94A3B8] tabular-nums">
                        {l.borrowDate} s/d {l.dueDate}
                      </span>
                      <span className="font-mono text-amber-400 uppercase">{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E293B]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#151E2E] hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => onBorrowClick(item)}
                disabled={item.status === 'maintenance' || item.seatsAvailable <= 0}
                className="px-4 py-2 text-xs font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Ajukan Peminjaman Alat Ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoanRequestModal({
  item,
  items,
  settings,
  activeHwCount,
  activeSwCount,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  item: AssetItem | null;
  items: AssetItem[];
  settings: SystemSettings;
  activeHwCount: number;
  activeSwCount: number;
  onClose: () => void;
  onSubmit: (payload: {
    itemId: number;
    borrowDate: string;
    dueDate: string;
    purpose: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [selectedItemId, setSelectedItemId] = useState<number>(
    item?.id || items.find((i) => i.seatsAvailable > 0)?.id || 1
  );
  const [borrowDate, setBorrowDate] = useState<string>('2026-11-12');
  const [dueDate, setDueDate] = useState<string>('2026-11-16');
  const [purpose, setPurpose] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const chosenItem = items.find((i) => i.id === Number(selectedItemId));
  const maxDays = Number(settings.max_loan_days || 7);
  const maxHw = Number(settings.max_hardware_loans || 2);
  const maxSw = Number(settings.max_software_loans || 3);

  const startMs = new Date(borrowDate).getTime();
  const endMs = new Date(dueDate).getTime();
  const durationDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!chosenItem) {
      setLocalError('Silakan pilih alat yang ingin dipinjam.');
      return;
    }
    if (isNaN(durationDays) || durationDays < 1) {
      setLocalError('Tanggal pengembalian harus minimal 1 hari setelah tanggal pinjam.');
      return;
    }
    if (durationDays > maxDays) {
      setLocalError(
        `Durasi pinjam (${durationDays} hari) melebihi batas maksimal ${maxDays} hari.`
      );
      return;
    }
    if (purpose.trim().length < 8) {
      setLocalError('Jelaskan tujuan akademik/operasional peminjaman minimal 8 karakter.');
      return;
    }
    await onSubmit({
      itemId: chosenItem.id,
      borrowDate,
      dueDate,
      purpose: purpose.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
          <div>
            <h3 className="text-base font-bold text-white">Form Pengajuan Peminjaman Alat</h3>
            <p className="text-xs text-[#94A3B8]">
              Validasi otomatis kuota aktif, durasi pinjam, dan ketersediaan jadwal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Active Borrower Quota Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#090D16] border border-[#1E293B] rounded text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Kuota Laptop Aktif:</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  activeHwCount >= maxHw ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {activeHwCount} / {maxHw} Unit
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Kuota Lisensi Aktif:</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  activeSwCount >= maxSw ? 'text-red-400' : 'text-[#38BDF8]'
                }`}
              >
                {activeSwCount} / {maxSw} Seat
              </span>
            </div>
          </div>

          {localError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pilih Perangkat Keras / Lisensi Perangkat Lunak
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
            >
              {items.map((it) => (
                <option
                  key={it.id}
                  value={it.id}
                  disabled={it.seatsAvailable <= 0 || it.status === 'maintenance'}
                >
                  [{it.assetCode}] {it.name} — Sisa: {it.seatsAvailable}/{it.seatsTotal}{' '}
                  {it.assetType === 'hardware' ? 'Unit' : 'Seat'} ({it.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {chosenItem && (
            <div className="p-3 bg-[#090D16] border border-[#1E293B] rounded text-xs text-[#94A3B8] flex items-center justify-between">
              <span>
                Spesifikasi:{' '}
                <strong className="text-slate-200">
                  {chosenItem.assetType === 'hardware'
                    ? `${chosenItem.specs.cpu} · ${chosenItem.specs.ram}`
                    : `${chosenItem.specs.version} · ${chosenItem.specs.licenseType}`}
                </strong>
              </span>
              <span className="font-mono text-[#38BDF8] tabular-nums">{chosenItem.assetCode}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tanggal Mulai Pinjam
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Rencana Tanggal Kembali (Maks {maxDays} Hari)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#94A3B8]">Estimasi Durasi Peminjaman:</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                durationDays > maxDays || durationDays < 1 ? 'text-red-400' : 'text-[#38BDF8]'
              }`}
            >
              {isNaN(durationDays) ? '0' : durationDays} Hari (Batas Kebijakan: {maxDays} Hari)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tujuan Penggunaan / Mata Kuliah / Proyek Riset
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Pengujian model deep learning untuk Tugas Akhir Semester Ganjil..."
              required
              className="w-full px-3.5 py-2 text-sm bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#151E2E] hover:bg-slate-800 rounded cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              {isSubmitting ? 'Memproses...' : 'Kirim Pengajuan Peminjaman'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReturnInspectionModal({
  loan,
  item,
  borrowerName,
  dailyFineIdr,
  onClose,
  onConfirmReturn,
  isSubmitting,
}: {
  loan: LoanItem;
  item?: AssetItem;
  borrowerName: string;
  dailyFineIdr: number;
  onClose: () => void;
  onConfirmReturn: (payload: {
    loanId: number;
    returnedAt: string;
    conditionAfter: string;
    damageNotes: string;
    finePaid: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [returnedAt, setReturnedAt] = useState<string>('2026-11-12');
  const [conditionAfter, setConditionAfter] = useState<string>('baik');
  const [damageNotes, setDamageNotes] = useState<string>(
    'Unit dikembalikan lengkap dan berfungsi normal.'
  );
  const [finePaid, setFinePaid] = useState<boolean>(true);

  const dueMs = new Date(loan.dueDate).getTime();
  const returnMs = new Date(returnedAt).getTime();
  const rawLate = Math.ceil((returnMs - dueMs) / (1000 * 60 * 60 * 24));
  const lateDays = Math.max(0, isNaN(rawLate) ? 0 : rawLate);
  const fineAmount = lateDays * dailyFineIdr;
  const isDamaged = conditionAfter === 'rusak_ringan' || conditionAfter === 'rusak_berat';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmReturn({
      loanId: loan.id,
      returnedAt,
      conditionAfter,
      damageNotes,
      finePaid,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
          <div>
            <h3 className="text-base font-bold text-white">
              Verifikasi Pengembalian & Inspeksi Kondisi Alat
            </h3>
            <p className="text-xs font-mono text-[#38BDF8] tabular-nums">
              {loan.loanCode} · {item?.name} ({item?.assetCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#090D16] border border-[#1E293B] rounded text-xs">
            <div>
              <div className="text-[#94A3B8]">Peminjam</div>
              <div className="font-semibold text-white mt-0.5">{borrowerName}</div>
            </div>
            <div>
              <div className="text-[#94A3B8]">Tenggat Pengembalian</div>
              <div className="font-mono text-white font-semibold mt-0.5 tabular-nums">
                {loan.dueDate}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tanggal Pengembalian Aktual
              </label>
              <input
                type="date"
                value={returnedAt}
                onChange={(e) => setReturnedAt(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Hasil Verifikasi Kondisi Fisik / Lisensi
              </label>
              <select
                value={conditionAfter}
                onChange={(e) => setConditionAfter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
              >
                <option value="baik">Baik (Siap Dipinjam Kembali)</option>
                <option value="rusak_ringan">Rusak Ringan (Otomatis Masuk Maintenance)</option>
                <option value="rusak_berat">Rusak Berat (Otomatis Masuk Maintenance)</option>
              </select>
            </div>
          </div>

          {/* Automatic Late Fine Calculation Panel */}
          <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Perhitungan Keterlambatan Otomatis</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  lateDays > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {lateDays > 0 ? `Terlambat ${lateDays} Hari` : 'Tepat Waktu (0 Hari)'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
              <span className="text-xs text-[#94A3B8]">
                Total Denda ({lateDays} hari × {formatRupiah(dailyFineIdr)})
              </span>
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {formatRupiah(fineAmount)}
              </span>
            </div>
            {fineAmount > 0 && (
              <label className="flex items-center gap-2 pt-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-[#3B82F6]"
                />
                <span>Tandai denda keterlambatan sudah dibayar lunas saat serah terima</span>
              </label>
            )}
          </div>

          {isDamaged && item?.assetType === 'hardware' && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-300 flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>
                <strong>Proteksi Inventaris Otomatis:</strong> Karena kondisi fisik ditandai{' '}
                <span className="font-mono uppercase">{conditionAfter.replace('_', ' ')}</span>,
                status unit <strong>{item.assetCode}</strong> akan langsung dialihkan ke{' '}
                <strong>MAINTENANCE</strong> dan dikunci dari pengajuan pinjaman baru.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Catatan Pemeriksaan Petugas / Kelengkapan Aksesori
            </label>
            <textarea
              rows={2}
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#151E2E] hover:bg-slate-800 rounded cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              {isSubmitting ? 'Memproses...' : 'Selesaikan & Verifikasi Pengembalian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ItemFormModal({
  initialItem,
  categories,
  onClose,
  onSave,
  isSubmitting,
}: {
  initialItem: AssetItem | null;
  categories: CategoryItem[];
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [assetType, setAssetType] = useState<'hardware' | 'software'>(
    initialItem?.assetType || 'hardware'
  );
  const [assetCode, setAssetCode] = useState(
    initialItem?.assetCode || (assetType === 'hardware' ? 'HW-LPT-010' : 'SW-LIC-010')
  );
  const [name, setName] = useState(initialItem?.name || '');
  const [brand, setBrand] = useState(initialItem?.brand || '');
  const [model, setModel] = useState(initialItem?.model || '');
  const [categoryId, setCategoryId] = useState<number>(
    initialItem?.categoryId || categories[0]?.id || 1
  );
  const [condition, setCondition] = useState(initialItem?.condition || 'baik');
  const [status, setStatus] = useState(initialItem?.status || 'tersedia');
  const [seatsTotal, setSeatsTotal] = useState(
    initialItem?.seatsTotal ?? (assetType === 'hardware' ? 1 : 20)
  );
  const [seatsAvailable, setSeatsAvailable] = useState(
    initialItem?.seatsAvailable ?? (assetType === 'hardware' ? 1 : 20)
  );
  const [expiryDate, setExpiryDate] = useState(initialItem?.expiryDate || '2027-06-30');
  const [imageUrl, setImageUrl] = useState(
    initialItem?.imageUrl || '/images/hero_hardware_workstation_1794532739091.jpg'
  );

  // Hardware specs
  const [cpu, setCpu] = useState(initialItem?.specs.cpu || 'Apple M3 Pro 12-Core');
  const [ram, setRam] = useState(initialItem?.specs.ram || '32GB Unified');
  const [gpu, setGpu] = useState(initialItem?.specs.gpu || '18-Core GPU');
  const [storage, setStorage] = useState(initialItem?.specs.storage || '1TB NVMe SSD');
  const [os, setOs] = useState(initialItem?.specs.os || 'macOS Sequoia / Ubuntu 24.04');
  const [serialNumber, setSerialNumber] = useState(
    initialItem?.specs.serialNumber || 'SN-INV-202699'
  );

  // Software specs
  const [version, setVersion] = useState(initialItem?.specs.version || 'v2026.2 Enterprise');
  const [licenseType, setLicenseType] = useState(
    initialItem?.specs.licenseType || 'Floating Network Seat'
  );
  const [platform, setPlatform] = useState(
    initialItem?.specs.platform || 'Windows / macOS / Linux'
  );
  const [activationMode, setActivationMode] = useState(
    initialItem?.specs.activationMode || 'SSO License Server'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const specs =
      assetType === 'hardware'
        ? { cpu, ram, gpu, storage, os, serialNumber }
        : { version, licenseType, platform, activationMode };

    await onSave({
      id: initialItem?.id,
      assetCode,
      name,
      brand,
      model,
      categoryId,
      assetType,
      specs,
      condition,
      status,
      seatsTotal: assetType === 'hardware' ? 1 : Number(seatsTotal),
      seatsAvailable: assetType === 'hardware' ? (status === 'tersedia' ? 1 : 0) : Number(seatsAvailable),
      expiryDate: assetType === 'software' ? expiryDate : null,
      imageUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
          <h3 className="text-base font-bold text-white">
            {initialItem ? `Edit Data Alat (${initialItem.assetCode})` : 'Tambah Alat / Lisensi Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Tipe Aset</label>
              <select
                value={assetType}
                onChange={(e) => {
                  const next = e.target.value as 'hardware' | 'software';
                  setAssetType(next);
                  if (!initialItem) {
                    setAssetCode(next === 'hardware' ? 'HW-LPT-010' : 'SW-LIC-010');
                    setImageUrl(
                      next === 'hardware'
                        ? '/images/hero_hardware_workstation_1794532739091.jpg'
                        : '/images/asset_software_license_vault_1794532742212.jpg'
                    );
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
              >
                <option value="hardware">Perangkat Keras (Laptop)</option>
                <option value="software">Perangkat Lunak (Lisensi)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Kode Aset Unik</label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Merk / Vendor</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Apple / Lenovo / Adobe"
                required
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Tipe / Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="A2991 / CC-2026"
                required
                className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs text-slate-300 mb-1">Gambar Produk Studio</label>
              <select
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
              >
                <option value="/images/hero_hardware_workstation_1794532739091.jpg">
                  Workstation Pro Studio
                </option>
                <option value="/images/asset_laptop_ultrabook_1794532740208.jpg">
                  Developer Ultrabook
                </option>
                <option value="/images/asset_laptop_gpu_rig_1794532741304.jpg">
                  GPU Rendering Rig
                </option>
                <option value="/images/asset_software_license_vault_1794532742212.jpg">
                  Enterprise License Vault
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Nama Lengkap Alat / Lisensi</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: MacBook Pro 16 M3 Max / MATLAB Campus License"
              required
              className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Kondisi</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetItem['condition'])}
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
              >
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetItem['status'])}
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
              >
                <option value="tersedia">Tersedia</option>
                <option value="dipinjam">Sedang Dipinjam</option>
                <option value="maintenance">Maintenance</option>
                <option value="kedaluwarsa">Kedaluwarsa</option>
              </select>
            </div>
            {assetType === 'software' && (
              <>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Total Seat</label>
                  <input
                    type="number"
                    min={1}
                    value={seatsTotal}
                    onChange={(e) => setSeatsTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Seat Tersisa</label>
                  <input
                    type="number"
                    min={0}
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                  />
                </div>
              </>
            )}
          </div>

          {/* Dynamic JSONB Specification Fields */}
          <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-3">
            <div className="text-xs font-mono text-[#38BDF8]">
              ATRIBUT SPESIFIKASI TEKNIS (POSTGRESQL JSONB)
            </div>
            {assetType === 'hardware' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Prosesor (CPU)</label>
                  <input
                    type="text"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Kapasitas RAM</label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">GPU / Accelerator</label>
                  <input
                    type="text"
                    value={gpu}
                    onChange={(e) => setGpu(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Storage SSD</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Sistem Operasi</label>
                  <input
                    type="text"
                    value={os}
                    onChange={(e) => setOs(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Versi Perangkat Lunak</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Jenis Lisensi</label>
                  <input
                    type="text"
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Platform OS</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0F1623] border border-[#1E293B] rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#94A3B8] mb-1">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#0F1623] border border-[#1E293B] rounded text-white tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#151E2E] hover:bg-slate-800 rounded cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data Aset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
