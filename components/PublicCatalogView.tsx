'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Laptop,
  KeyRound,
  QrCode,
  ArrowUpRight,
  SlidersHorizontal,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  AssetItem,
  CategoryItem,
  SystemSettings,
  UserItem,
  formatRupiah,
  getDaysUntil,
  getItemStatusLabel,
} from './types';

export function PublicCatalogView({
  items,
  categories,
  settings,
  currentUser,
  onOpenLogin,
  onEnterWorkspace,
  onInspectItem,
  onBorrowItem,
  onOpenDocs,
}: {
  items: AssetItem[];
  categories: CategoryItem[];
  settings: SystemSettings;
  currentUser: UserItem | null;
  onOpenLogin: () => void;
  onEnterWorkspace: () => void;
  onInspectItem: (item: AssetItem) => void;
  onBorrowItem: (item: AssetItem) => void;
  onOpenDocs: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hardware' | 'software'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const hardwareItems = items.filter((i) => i.assetType === 'hardware');
  const softwareItems = items.filter((i) => i.assetType === 'software');
  const totalAvailableUnits = hardwareItems.filter((i) => i.status === 'tersedia').length;
  const totalAvailableSeats = softwareItems.reduce((acc, s) => acc + s.seatsAvailable, 0);
  const totalSoftwareSeats = softwareItems.reduce((acc, s) => acc + s.seatsTotal, 0);

  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'all' && item.assetType !== typeFilter) return false;
    if (categoryFilter !== 'all' && item.categoryId !== Number(categoryFilter)) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const specString = JSON.stringify(item.specs).toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.assetCode.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        specString.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 lg:px-10 py-4 bg-[#090D16]/95 border-b border-[#1E293B]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
        >
          INVENTRA
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A3B8]">
          <a
            href="#katalog"
            onClick={() => setTypeFilter('all')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Katalog Alat
          </a>
          <a
            href="#katalog"
            onClick={() => setTypeFilter('hardware')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Unit Laptop
          </a>
          <a
            href="#katalog"
            onClick={() => setTypeFilter('software')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Lisensi Software
          </a>
          <a
            href="#prosedur"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Aturan Peminjaman
          </a>
          <button
            type="button"
            onClick={onOpenDocs}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Arsitektur Desain
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <button
              onClick={onEnterWorkspace}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Buka Dashboard ({currentUser.role.toUpperCase()})
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk / Pilih Role Demo
            </button>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-[1360px] w-full mx-auto px-6 lg:px-10 py-10 space-y-14">
        {/* Asymmetric Hero Section (2-Column Split + Full-Width KPI Strip Below) */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Editorial Hardware Lab Value Proposition */}
            <div className="lg:col-span-7 flex flex-col justify-between p-7 sm:p-9 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#38BDF8] tracking-wide">
                  {settings.lab_name.toUpperCase()}
                </div>
                <h1
                  className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.14] font-display"
                  style={{ textWrap: 'balance' }}
                >
                  Kendali Inventaris Workstation & Lisensi Perangkat Lunak Terpadu
                </h1>
                <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl">
                  Sistem peminjaman terstruktur dengan pelacakan nomor seri unit fisik, alokasi kuota{' '}
                  <em>floating seat</em> lisensi perangkat lunak, deteksi bentrok jadwal otomatis,
                  dan verifikasi pengembalian berstandar laboratorium.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (currentUser) {
                      onEnterWorkspace();
                    } else {
                      onOpenLogin();
                    }
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {currentUser ? 'Masuk ke Ruang Kerja Anda' : 'Ajukan Peminjaman Sekarang'}
                </button>
                <a
                  href="#katalog"
                  className="px-5 py-2.5 text-xs font-medium text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded transition-colors whitespace-nowrap shrink-0"
                >
                  Jelajahi Katalog ({items.length} Aset)
                </a>
              </div>
            </div>

            {/* Right Column: Studio Hardware Workstation Image */}
            <div className="lg:col-span-5 relative min-h-[280px] bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
              <Image
                src="/images/hero_hardware_workstation_1794532739091.jpg"
                alt="Workstation Laptop Laboratorium"
                fill
                referrerPolicy="no-referrer"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#090D16]/90 border border-[#1E293B] rounded flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-[#38BDF8] tabular-nums">
                    HW-MBP16-01 · STUDIO NODE
                  </div>
                  <div className="text-xs font-medium text-white mt-0.5">
                    MacBook Pro 16&quot; M3 Max · 64GB Unified · 2TB NVMe
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 shrink-0">TERSEDIA</span>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Live PostgreSQL Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
              <div className="text-xs text-[#94A3B8]">Unit Laptop Siap Pinjam</div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                {totalAvailableUnits} / {hardwareItems.length}{' '}
                <span className="text-xs font-normal text-[#94A3B8]">Unit</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Dilacak per nomor seri & QR code aset
              </div>
            </div>

            <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
              <div className="text-xs text-[#94A3B8]">Kuota Seat Lisensi Tersedia</div>
              <div className="text-2xl font-bold font-mono text-[#38BDF8] mt-1.5 tabular-nums">
                {totalAvailableSeats} / {totalSoftwareSeats}{' '}
                <span className="text-xs font-normal text-[#94A3B8]">Seat</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {softwareItems.length} paket perangkat lunak berlisensi
              </div>
            </div>

            <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
              <div className="text-xs text-[#94A3B8]">Batas Kuota Aktif Peminjam</div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                {settings.max_hardware_loans} LPT · {settings.max_software_loans} SW
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Durasi standar maksimal {settings.max_loan_days} hari kerja
              </div>
            </div>

            <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
              <div className="text-xs text-[#94A3B8]">Kebijakan Denda Keterlambatan</div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                {formatRupiah(Number(settings.daily_fine_idr || 25000))}
                <span className="text-xs font-normal text-[#94A3B8]">/hari</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Kalkulasi otomatis saat inspeksi pengembalian
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Hardware & Software Catalog Section */}
        <section id="katalog" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1E293B]">
            <div>
              <div className="text-xs font-mono text-[#38BDF8]">
                INVENTARIS REAL-TIME POSTGRESQL
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1 font-display">
                Katalog Perangkat Keras & Lisensi Perangkat Lunak
              </h2>
            </div>

            {/* Interactive Segmented Filter Controls */}
            <div className="flex items-center gap-1 p-1 bg-[#0F1623] border border-[#1E293B] rounded">
              {[
                { id: 'all', label: `Semua Aset (${items.length})` },
                { id: 'hardware', label: `Laptop (${hardwareItems.length})` },
                { id: 'software', label: `Software (${softwareItems.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id as typeof typeFilter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    typeFilter === tab.id
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Multi-Dimension Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#0F1623] border border-[#1E293B] rounded-md">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode aset (HW-MBP16), nama laptop, RAM, GPU, atau lisensi software..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                aria-label="Filter Kategori"
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
              >
                <option value="all">Semua Kategori ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter Status Ketersediaan"
                className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
              >
                <option value="all">Semua Status Ketersediaan</option>
                <option value="tersedia">Tersedia Siap Pinjam</option>
                <option value="dipinjam">Sedang Dipinjam</option>
                <option value="maintenance">Dalam Maintenance</option>
              </select>
            </div>
          </div>

          {/* Asset Catalog Grid */}
          {filteredItems.length === 0 ? (
            <div className="p-12 bg-[#0F1623] border border-[#1E293B] rounded-md text-center space-y-3">
              <SlidersHorizontal className="w-6 h-6 text-[#94A3B8] mx-auto" />
              <div className="text-sm font-semibold text-white">
                Tidak ada aset yang cocok dengan filter pencarian
              </div>
              <p className="text-xs text-[#94A3B8]">
                Coba ubah kata kunci spesifikasi atau reset filter kategori dan status.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#3B82F6] rounded cursor-pointer"
              >
                Reset Filter Katalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const statusInfo = getItemStatusLabel(item.status);
                const cat = categories.find((c) => c.id === item.categoryId);
                const daysLeft = getDaysUntil(item.expiryDate);
                const isExpiringSoon = daysLeft !== null && daysLeft <= 30;

                return (
                  <article
                    key={item.id}
                    className="bg-[#0F1623] border border-[#1E293B] hover:border-[#334155] rounded-md overflow-hidden flex flex-col justify-between transition-colors"
                  >
                    <div>
                      {/* Image Header with Technical Overlay */}
                      <div className="relative aspect-4/3 w-full bg-[#090D16] border-b border-[#1E293B] overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-black/40" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-mono bg-[#090D16]/90 border border-[#1E293B] text-[#38BDF8] rounded tabular-nums">
                            {item.assetCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[11px] font-mono border rounded ${statusInfo.colorClass}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                          <span className="font-mono text-[11px] text-[#94A3B8]">
                            {cat?.name || item.brand}
                          </span>
                          <span className="font-mono text-[11px] text-white tabular-nums">
                            {item.seatsAvailable}/{item.seatsTotal}{' '}
                            {item.assetType === 'hardware' ? 'Unit' : 'Seat'}
                          </span>
                        </div>
                      </div>

                      {/* Card Body — Clean Unboxed Metadata */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-white leading-snug">
                            {item.name}
                          </h3>
                          {/* Zero-Pill Unboxed Metadata with typographic separators */}
                          <div className="text-xs text-[#94A3B8] mt-1">
                            <span>{item.brand}</span>
                            <span aria-hidden="true"> · </span>
                            <span className="font-mono">{item.model}</span>
                            <span aria-hidden="true"> · </span>
                            <span>
                              Kondisi: {item.condition.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Technical Spec Summary Line */}
                        <div className="p-3 bg-[#090D16] border border-[#1E293B] rounded text-xs text-slate-300 font-mono leading-relaxed">
                          {item.assetType === 'hardware' ? (
                            <>
                              {item.specs.cpu} · {item.specs.ram} · {item.specs.gpu} ·{' '}
                              {item.specs.storage}
                            </>
                          ) : (
                            <>
                              {item.specs.version} · {item.specs.licenseType} ·{' '}
                              {item.specs.platform}
                            </>
                          )}
                        </div>

                        {/* Software Seat Progress or Expiry Alert */}
                        {item.assetType === 'software' && (
                          <div className="space-y-1.5">
                            <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#38BDF8]"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(
                                      (item.seatsAvailable / Math.max(1, item.seatsTotal)) * 100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                            {isExpiringSoon && (
                              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono tabular-nums">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  Lisensi berakhir {item.expiryDate} ({daysLeft} hari lagi)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3.5 bg-[#090D16]/60 border-t border-[#1E293B] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onInspectItem(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Spesifikasi & QR
                      </button>

                      <button
                        type="button"
                        onClick={() => onBorrowItem(item)}
                        disabled={item.status === 'maintenance' || item.seatsAvailable <= 0}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Pinjam Aset</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Operational Procedure & Policy Section */}
        <section
          id="prosedur"
          className="p-7 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1E293B]">
            <div>
              <div className="text-xs font-mono text-[#38BDF8]">
                PROSEDUR STANDAR OPERASIONAL LABORATORIUM
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5 font-display">
                Alur Peminjaman, Verifikasi Kondisi, dan Ketentuan Denda
              </h3>
            </div>
            <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
              KEBIJAKAN AKTIF 2026/2027
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            <div className="space-y-2">
              <div className="font-mono text-[#38BDF8] font-semibold">
                01. Kuota & Pengajuan Bebas Bentrok
              </div>
              <p className="text-[#94A3B8]">
                Setiap peminjam dapat mengajukan maksimal{' '}
                <strong className="text-white font-mono">{settings.max_hardware_loans} unit laptop</strong> dan{' '}
                <strong className="text-white font-mono">{settings.max_software_loans} lisensi software</strong>{' '}
                aktif secara bersamaan dengan durasi pinjam hingga{' '}
                <strong className="text-white font-mono">{settings.max_loan_days} hari</strong>. Sistem otomatis menolak jadwal yang bentrok.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-[#38BDF8] font-semibold">
                02. Serah Terima & Slip Bukti QR Code
              </div>
              <p className="text-[#94A3B8]">
                Setelah disetujui oleh Petugas Laboratorium, peminjam dapat mencetak{' '}
                <strong className="text-white">Bukti Peminjaman PDF</strong> yang dilengkapi QR Code unik transaksi. Kuota <em>seat</em> lisensi software akan dialokasikan secara otomatis.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-[#38BDF8] font-semibold">
                03. Inspeksi Pengembalian & Auto-Maintenance
              </div>
              <p className="text-[#94A3B8]">
                Saat dikembalikan, petugas memverifikasi kondisi fisik alat. Keterlambatan dikenakan denda otomatis{' '}
                <strong className="text-white font-mono">
                  {formatRupiah(Number(settings.daily_fine_idr || 25000))}/hari
                </strong>
                . Perangkat yang dikembalikan dalam keadaan rusak otomatis beralih ke status{' '}
                <strong className="text-orange-400 font-mono">MAINTENANCE</strong>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Functional Footer */}
      <footer className="border-t border-[#1E293B] bg-[#090D16] px-6 lg:px-10 py-6 text-xs text-[#94A3B8]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">INVENTRA</span> · {settings.lab_name}
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenDocs}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dokumentasi Desain (Fase 1–8)
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Akses Portal Petugas & Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
