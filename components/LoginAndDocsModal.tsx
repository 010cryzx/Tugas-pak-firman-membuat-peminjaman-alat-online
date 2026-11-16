'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  UserCheck,
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../src/lib/firebase';
import { UserItem } from './types';

export function LoginModal({
  users,
  onClose,
  onLoginSuccess,
}: {
  users: UserItem[];
  onClose: () => void;
  onLoginSuccess: (user: UserItem, token: string) => void;
}) {
  const [identifier, setIdentifier] = useState('admin@inventra.ac.id');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'credentials',
          identifier,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Login gagal.');
      } else {
        onLoginSuccess(data.user, data.token);
      }
    } catch {
      setErrorMsg('Gagal menghubungi server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUsername: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'demo_quick',
          identifier: demoUsername,
          password: 'demo',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memuat akun demo.');
      } else {
        onLoginSuccess(data.user, data.token);
      }
    } catch {
      setErrorMsg('Gagal memuat sesi akun demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'firebase_google',
          idToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal menyinkronkan akun Google.');
      } else {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login Google dibatalkan atau gagal.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts =
    users.length > 0
      ? users
      : [
          {
            id: 1,
            uid: 'demo-admin-01',
            name: 'Arif Pratama, S.Kom.',
            email: 'admin@inventra.ac.id',
            username: 'admin',
            role: 'admin' as const,
            department: 'Manajemen Infrastruktur & Lab',
            identityNumber: 'NIP-19890412-001',
            phone: '0811-2400-101',
            isActive: true,
            deletedAt: null,
            createdAt: '',
          },
          {
            id: 2,
            uid: 'demo-petugas-01',
            name: 'Dina Maharani, A.Md.',
            email: 'petugas1@inventra.ac.id',
            username: 'petugas1',
            role: 'petugas' as const,
            department: 'Operasional Lab Perangkat Keras',
            identityNumber: 'NIP-19940821-012',
            phone: '0812-3490-202',
            isActive: true,
            deletedAt: null,
            createdAt: '',
          },
          {
            id: 4,
            uid: 'demo-peminjam-01',
            name: 'Nadia Kusuma',
            email: 'nadia.kusuma@student.ac.id',
            username: 'nadia',
            role: 'peminjam' as const,
            department: 'Teknik Informatika',
            identityNumber: 'NIM-2301014012',
            phone: '0857-1029-4001',
            isActive: true,
            deletedAt: null,
            createdAt: '',
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Credential & SSO Form */}
        <div className="md:col-span-6 p-6 sm:p-7 space-y-5 border-b md:border-b-0 md:border-r border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#38BDF8]">
                AUTENTIKASI SISTEM INVENTRA
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">Masuk ke Ruang Kerja</h3>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username atau Email Instansi
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="admin@inventra.ac.id / nadia"
                className="w-full px-3.5 py-2 text-sm bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi (Default Demo: <span className="font-mono text-[#38BDF8]">password123</span>)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-[#090D16] border border-[#1E293B] focus:border-[#3B82F6] rounded text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {loading ? 'Memverifikasi Sesi...' : 'Masuk dengan Kredensial'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-[#1E293B]" />
            <span className="shrink mx-3 text-[11px] font-mono text-[#94A3B8]">
              ATAU SSO GOOGLE
            </span>
            <div className="grow border-t border-[#1E293B]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-medium text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#38BDF8]" />
            Masuk dengan Google Workspace / Firebase Auth
          </button>
        </div>

        {/* Right Column: Instant Role Switcher (8 Seeded Accounts) */}
        <div className="md:col-span-6 p-6 sm:p-7 bg-[#090D16] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#38BDF8]">
                AKUN DEMO SIAP UJI (POSTGRESQL SEED)
              </span>
              <button
                onClick={onClose}
                className="hidden md:inline-flex p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Klik salah satu akun di bawah untuk langsung masuk dan menguji matriks fitur sesuai role (1 Admin, 2 Petugas, 5 Peminjam):
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.uid}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin(acc.username)}
                  className="w-full p-2.5 bg-[#0F1623] hover:bg-[#151E2E] border border-[#1E293B] hover:border-[#3B82F6]/60 rounded text-left transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#94A3B8]">
                        · {acc.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {acc.email} · {acc.identityNumber}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#3B82F6] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] text-[#94A3B8] flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Dilengkapi proteksi Bcrypt, validasi server-side, throttle login, dan RBAC 403.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RejectReasonModal({
  loanCode,
  onClose,
  onConfirmReject,
  isSubmitting,
}: {
  loanCode: string;
  onClose: () => void;
  onConfirmReject: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState(
    'Jadwal penggunaan bentrok dengan kegiatan praktikum wajib laboratorium.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) return;
    await onConfirmReject(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#151E2E] border-b border-[#1E293B]">
          <h3 className="text-sm font-bold text-white">
            Tolak Pengajuan Peminjaman ({loanCode})
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Alasan Penolakan (Wajib diisi untuk notifikasi peminjam)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-300 bg-[#151E2E] rounded cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded cursor-pointer"
            >
              {isSubmitting ? 'Memproses...' : 'Konfirmasi Penolakan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DesignDocsModal({ onClose }: { onClose: () => void }) {
  const [activeDoc, setActiveDoc] = useState<
    'research' | 'direction' | 'system' | 'review' | 'roadmap'
  >('direction');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#38BDF8]" />
            <span className="font-mono text-xs text-white">
              DOKUMENTASI ARSITEKTUR & DESAIN (FASE 1 – FASE 8)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1 px-6 py-2.5 bg-[#090D16] border-b border-[#1E293B]">
          {[
            { id: 'research', label: '1. DESIGN_RESEARCH.md' },
            { id: 'direction', label: '2. DESIGN_DIRECTION.md' },
            { id: 'system', label: '5. DESIGN_SYSTEM.md' },
            { id: 'review', label: '8. DESIGN_REVIEW.md' },
            { id: 'roadmap', label: 'ROADMAP & AGENTS.md' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDoc(tab.id as typeof activeDoc)}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeDoc === tab.id
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#151E2E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed">
          {activeDoc === 'research' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white">
                Fase 1 — Riset Desain Produk Referensi (docs/DESIGN_RESEARCH.md)
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Menganalisis sistem manajemen aset dunia nyata dan konsol teknis berpresisi tinggi:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-1.5">
                  <div className="font-mono text-[#38BDF8]">01. Linear & Vercel Console</div>
                  <p>
                    Kanvas grafit gelap berlapis tunggal (*single-elevation depth*), garis struktur 1px, kontras teks putih tajam, dan efisiensi pemindaian tabel kepadatan tinggi.
                  </p>
                </div>
                <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-1.5">
                  <div className="font-mono text-[#38BDF8]">02. Framework & Teenage Engineering</div>
                  <p>
                    Penyajian spesifikasi perangkat keras layaknya lembar *datasheet* teknis dengan kode unik monospace, label QR per unit, dan fotografi produk studio berlatar gelap.
                  </p>
                </div>
                <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-1.5">
                  <div className="font-mono text-[#38BDF8]">03. Snipe-IT & Shelf.nu Asset Ledger</div>
                  <p>
                    Pemisahan tegas antara aset fisik berwujud (1 unit per nomor seri + status kondisi/maintenance) dan lisensi perangkat lunak (kuota *seat total vs seat tersedia* + masa berlaku).
                  </p>
                </div>
                <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-1.5">
                  <div className="font-mono text-[#38BDF8]">04. Prinsip Anti-AI-Slop</div>
                  <p>
                    Menghilangkan gradasi ungu-biru, kapsul pill berlapis pada metadata statis, titik berkedip palsu, dan angka statistik rekayasa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'direction' && (
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white">
                Fase 2 — Creative Direction: &ldquo;Dark Hardware Lab&rdquo; (docs/DESIGN_DIRECTION.md)
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Identitas visual ruang inventaris laboratorium komputer dengan latar gelap grafit teknis, indikator status putih bersih, dan aksen biru menyala yang elegan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-[#090D16] border border-[#1E293B] rounded">
                  <div className="font-mono text-white font-semibold">60% Kanvas Grafit</div>
                  <div className="font-mono text-[#94A3B8] mt-1">#090D16 · #0F1623</div>
                  <p className="mt-1 text-slate-400">
                    Menurunkan kelelahan mata operator laboratorium saat memeriksa tabel antrean panjang.
                  </p>
                </div>
                <div className="p-3.5 bg-[#090D16] border border-[#1E293B] rounded">
                  <div className="font-mono text-white font-semibold">30% Struktur & Teks Putih</div>
                  <div className="font-mono text-[#94A3B8] mt-1">#F8FAFC · Border #1E293B</div>
                  <p className="mt-1 text-slate-400">
                    Tipografi Outfit & Plus Jakarta Sans dengan rasio kontras tinggi di atas permukaan gelap.
                  </p>
                </div>
                <div className="p-3.5 bg-[#090D16] border border-[#3B82F6]/40 rounded">
                  <div className="font-mono text-[#38BDF8] font-semibold">10% Aksen Biru Elektrik</div>
                  <div className="font-mono text-[#94A3B8] mt-1">#3B82F6 · #38BDF8</div>
                  <p className="mt-1 text-slate-400">
                    Terfokus pada tombol aksi primer, status pinjaman aktif, dan indikator kapasitas seat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'system' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-base font-bold text-white">
                Fase 5 — Design System & Typography Scale (docs/DESIGN_SYSTEM.md)
              </h4>
              <ul className="space-y-2 list-disc pl-5 text-slate-300">
                <li>
                  <strong>Font Display:</strong> <span className="font-mono">Outfit</span> (600/700) untuk hierarki judul halaman dan nilai metrik utama.
                </li>
                <li>
                  <strong>Font Body:</strong> <span className="font-mono">Plus Jakarta Sans</span> (400/500/600) untuk keterbacaan tabel dan formulir.
                </li>
                <li>
                  <strong>Font Monospace & Angka Tabular:</strong> <span className="font-mono">JetBrains Mono (tabular-nums)</span> untuk seluruh kode aset (<span className="font-mono text-[#38BDF8]">HW-MBP16-01</span>), tanggal, sisa seat, dan perhitungan denda Rupiah.
                </li>
                <li>
                  <strong>Badge Status Konsisten:</strong> Menunggu (Amber), Disetujui (Emerald), Sedang Dipinjam (Electric Blue), Dikembalikan (Slate), Terlambat / Ditolak (Crimson), Maintenance (Orange).
                </li>
              </ul>
            </div>
          )}

          {activeDoc === 'review' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-base font-bold text-white">
                Fase 8 — Kritik & Penyempurnaan Desain (docs/DESIGN_REVIEW.md)
              </h4>
              <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Seluruh Angka Bersumber dari Database PostgreSQL Nyata</span>
                </div>
                <p className="text-slate-300">
                  Tidak ada angka statistik karangan. Setiap perubahan status peminjaman, persetujuan petugas, pengembalian unit rusak (otomatis menjadi Maintenance), dan penambahan alat baru langsung memperbarui metrik dashboard dan grafik secara real-time.
                </p>
              </div>
            </div>
          )}

          {activeDoc === 'roadmap' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-base font-bold text-white">
                Checklist Modul & Skenario Uji Lengkap (docs/ROADMAP.md & AGENTS.md)
              </h4>
              <div className="p-4 bg-[#090D16] border border-[#1E293B] rounded font-mono space-y-1.5 text-slate-300">
                <div>[✓] PostgreSQL Cloud SQL + Drizzle ORM Schema (8 Tabel + JSONB Specs)</div>
                <div>[✓] Seeder Otomatis: 1 Admin, 2 Petugas, 5 Peminjam, 5 Kategori, 15 Alat</div>
                <div>[✓] Alur Peminjaman: Validasi Kuota (Maks 2 Laptop & 3 Lisensi), Bentrok Jadwal, Cetak Slip PDF</div>
                <div>[✓] Alur Pengembalian: Inspeksi Kondisi Fisik, Hitung Denda Otomatis Rp 25.000/hari, Auto-Maintenance</div>
                <div>[✓] Laporan & Audit: Filter Multi-Dimensi, Ekspor CSV/Excel, Cetak PDF, Log Aktivitas Otomatis</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
