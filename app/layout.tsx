import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'INVENTRA — Sistem Peminjaman Laptop & Lisensi Perangkat Lunak',
  description:
    'Aplikasi manajemen inventaris, peminjaman perangkat keras (laptop/workstation) dan lisensi perangkat lunak laboratorium dengan verifikasi pengembalian, denda otomatis, dan log audit.',
  openGraph: {
    title: 'INVENTRA — Sistem Peminjaman Laptop & Lisensi Perangkat Lunak',
    description:
      'Aplikasi manajemen inventaris, peminjaman perangkat keras (laptop/workstation) dan lisensi perangkat lunak laboratorium dengan verifikasi pengembalian, denda otomatis, dan log audit.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INVENTRA — Sistem Peminjaman Laptop & Lisensi Perangkat Lunak',
    description:
      'Aplikasi manajemen inventaris, peminjaman perangkat keras (laptop/workstation) dan lisensi perangkat lunak laboratorium dengan verifikasi pengembalian, denda otomatis, dan log audit.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#090D16] text-[#F8FAFC] font-sans antialiased selection:bg-[#3B82F6]/30 selection:text-white min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
