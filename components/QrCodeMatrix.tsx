'use client';

import React from 'react';
import { Printer, X, QrCode, ShieldCheck, Laptop, KeyRound } from 'lucide-react';
import { AssetItem, LoanItem, UserItem, formatRupiah } from './types';

export function QrCodeSvg({
  value,
  size = 96,
  light = false,
}: {
  value: string;
  size?: number;
  light?: boolean;
}) {
  // Deterministic 11x11 matrix generator from string payload
  const grid = 11;
  const cells: boolean[][] = Array.from({ length: grid }, () => Array(grid).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells[r0 + r][c0 + c] = true;
      }
    }
    cells[r0 + 1][c0 + 1] = true;
  };

  drawFinder(0, 0);
  drawFinder(0, grid - 3);
  drawFinder(grid - 3, 0);

  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const inFinder =
        (r < 4 && c < 4) || (r < 4 && c >= grid - 4) || (r >= grid - 4 && c < 4);
      if (!inFinder) {
        const bitIdx = (r * grid + c) % 31;
        const charCode = value.charCodeAt((r + c) % value.length) || 7;
        cells[r][c] = ((hash >> bitIdx) ^ charCode) % 2 === 0;
      }
    }
  }

  const fg = light ? '#090D16' : '#F8FAFC';
  const bg = light ? '#FFFFFF' : '#090D16';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid + 2} ${grid + 2}`}
      className="border border-[#1E293B] rounded"
      aria-label={`QR Code ${value}`}
    >
      <rect width={grid + 2} height={grid + 2} fill={bg} />
      {cells.map((row, rIdx) =>
        row.map((active, cIdx) =>
          active ? (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx + 1}
              y={rIdx + 1}
              width={0.92}
              height={0.92}
              fill={fg}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function LoanSlipModal({
  loan,
  item,
  borrower,
  approver,
  dailyFineIdr,
  onClose,
}: {
  loan: LoanItem;
  item?: AssetItem;
  borrower?: UserItem;
  approver?: UserItem;
  dailyFineIdr: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4 text-[#3B82F6]" />
            <span className="font-mono text-xs text-[#F8FAFC] tracking-wider">
              DOKUMEN BUKTI PEMINJAMAN RESMI · {loan.loanCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-8 space-y-6 bg-[#090D16] text-[#F8FAFC]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#1E293B]">
            <div>
              <div className="text-xs font-mono text-[#38BDF8] mb-1">
                LABORATORIUM KOMPUTASI & SISTEM TERPADU
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                BUKTI SERAH TERIMA PEMINJAMAN ALAT
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Harap tunjukkan dokumen atau kode QR ini kepada petugas laboratorium saat pengambilan dan pengembalian.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end shrink-0">
              <QrCodeSvg value={`INVENTRA-LOAN:${loan.loanCode}:${item?.assetCode || ''}`} size={84} />
              <span className="font-mono text-xs text-[#F8FAFC] mt-2 tabular-nums">
                {loan.loanCode}
              </span>
            </div>
          </div>

          {/* 2-Column Metadata Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-[#0F1623] border border-[#1E293B] rounded space-y-2.5">
              <div className="text-xs font-mono text-[#94A3B8]">DATA PEMINJAM</div>
              <div>
                <div className="text-xs text-[#94A3B8]">Nama Lengkap</div>
                <div className="font-semibold text-white">{borrower?.name || '-'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-[#94A3B8]">NIM / NIP</div>
                  <div className="font-mono text-xs text-slate-200 tabular-nums">
                    {borrower?.identityNumber || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#94A3B8]">Departemen</div>
                  <div className="text-xs text-slate-200">{borrower?.department || '-'}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0F1623] border border-[#1E293B] rounded space-y-2.5">
              <div className="text-xs font-mono text-[#94A3B8]">JADWAL & VERIFIKASI</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-[#94A3B8]">Tanggal Pinjam</div>
                  <div className="font-mono text-xs text-white tabular-nums">{loan.borrowDate}</div>
                </div>
                <div>
                  <div className="text-xs text-[#94A3B8]">Batas Kembali</div>
                  <div className="font-mono text-xs text-[#38BDF8] font-semibold tabular-nums">
                    {loan.dueDate}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="text-xs text-[#94A3B8]">Status Transaksi</div>
                  <div className="font-mono text-xs text-emerald-400 uppercase">{loan.status}</div>
                </div>
                <div>
                  <div className="text-xs text-[#94A3B8]">Petugas Verifikator</div>
                  <div className="text-xs text-slate-200">
                    {approver?.name || 'Menunggu Petugas'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Item Specification Box */}
          <div className="p-4 bg-[#0F1623] border border-[#1E293B] rounded space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#94A3B8]">
                SPESIFIKASI ASET YANG DIPINJAM
              </span>
              <span className="font-mono text-xs text-[#38BDF8] tabular-nums">
                {item?.assetCode}
              </span>
            </div>
            <div className="flex items-start gap-3">
              {item?.assetType === 'hardware' ? (
                <Laptop className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
              ) : (
                <KeyRound className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-white">
                  {item?.name} ({item?.brand} · {item?.model})
                </div>
                <div className="text-xs text-[#94A3B8]">
                  {item?.assetType === 'hardware'
                    ? `${item.specs.cpu || '-'} · ${item.specs.ram || '-'} · ${item.specs.gpu || '-'} · SN: ${item.specs.serialNumber || '-'}`
                    : `${item?.specs.version || '-'} · ${item?.specs.licenseType || '-'} · ${item?.specs.activationMode || '-'}`}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1E293B] text-xs text-slate-300">
              <span className="text-[#94A3B8]">Keperluan Peminjaman: </span>
              {loan.purpose}
            </div>
          </div>

          {/* Legal & Fine Notice */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#1E293B] text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Tarif keterlambatan berlaku otomatis sebesar{' '}
                <strong className="font-mono text-white tabular-nums">
                  {formatRupiah(dailyFineIdr)}/hari
                </strong>
                . Kerusakan perangkat wajib dilaporkan saat pengembalian.
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
              TERVERIFIKASI SISTEM INVENTRA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
