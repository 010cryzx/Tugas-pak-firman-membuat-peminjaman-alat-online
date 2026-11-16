import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 bg-[#0F1623] border border-[#1E293B] rounded-md text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded bg-[#151E2E] border border-[#1E293B] flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#38BDF8]" />
        </div>
        <div className="font-mono text-xs text-[#38BDF8]">HTTP 404 · HALAMAN TIDAK DITEMUKAN</div>
        <h1 className="text-xl font-bold text-white font-display">
          Rute atau Dokumen Inventaris Tidak Ditemukan
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Alamat URL yang Anda tuju tidak terdaftar pada sistem manajemen peminjaman alat laboratorium INVENTRA.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded transition-colors"
          >
            Kembali ke Katalog & Dashboard Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
