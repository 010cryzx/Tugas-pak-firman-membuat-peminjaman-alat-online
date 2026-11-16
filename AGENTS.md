# AGENTS.md — Panduan Arsitektur & Operasional Proyek INVENTRA

## 1. Ringkasan Proyek
**INVENTRA** adalah aplikasi manajemen peminjaman perangkat keras (laptop/workstation) dan perangkat lunak (lisensi software berbasis *seat*) laboratorium dengan kontrol akses berbasis peran (**Admin**, **Petugas**, **Peminjam**).

## 2. Tech Stack & Infrastruktur
- **Runtime & Framework**: Next.js 15 App Router (Full-Stack TypeScript)
- **Database**: Cloud SQL for PostgreSQL (`pg` + `drizzle-orm` dengan tipe kolom `jsonb` untuk spesifikasi teknis perangkat)
- **Autentikasi**: Session RBAC + Firebase Authentication (Google Sign-In) + Throttling Login
- **Styling**: Tailwind CSS v4 dengan sistem desain kustom **Dark Hardware Lab** (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`)

## 3. Matriks Role & Izin Akses (RBAC)
- **Admin (`admin@inventra.ac.id`)**: CRUD User, CRUD Kategori, CRUD Alat & Lisensi, CRUD Peminjaman & Pengembalian, Konfigurasi Kebijakan Denda, Laporan, dan Log Aktivitas.
- **Petugas (`petugas1@inventra.ac.id`, `petugas2@inventra.ac.id`)**: Menyetujui/menolak antrean peminjaman, memverifikasi pengembalian & kondisi fisik alat, memantau denda, dan mencetak laporan PDF/Excel.
- **Peminjam (`nadia`, `bagas`, `citra`, `fajar`, `kezia`)**: Melihat katalog & ketersediaan spesifikasi, mengajukan peminjaman (maks 2 laptop & 3 lisensi aktif), membatalkan pengajuan, mengajukan perpanjangan, mencetak slip bukti peminjaman PDF, dan mengajukan pengembalian.

## 4. Aturan Desain & Anti-AI-Slop
- Kanvas gelap grafit (`#090D16` & `#0F1623`) dengan tipografi putih tajam (`#F8FAFC`) dan aksen biru elektrik (`#3B82F6`).
- Seluruh metrik angka, kode aset, tanggal, dan nominal denda wajib menggunakan `font-mono tabular-nums`.
- Dilarang menggunakan pill badge berlebihan untuk metadata statis, dilarang menggunakan gradasi ungu-biru generik, dan seluruh angka dashboard bersumber langsung dari query PostgreSQL.
