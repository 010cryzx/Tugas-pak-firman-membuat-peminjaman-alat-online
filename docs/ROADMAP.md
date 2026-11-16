# ROADMAP & CHECKLIST MODUL (INVENTRA)

- [x] **Fase 1 & 2 — Riset Desain & Creative Direction**: Dokumentasi di `docs/DESIGN_RESEARCH.md` dan `docs/DESIGN_DIRECTION.md` dengan arah *Dark Hardware Lab*.
- [x] **Fase 5 — Design System**: Token warna grafit gelap, aksen biru elektrik, pasangan font `Outfit` + `Plus Jakarta Sans` + `JetBrains Mono` (`tabular-nums`).
- [x] **Database PostgreSQL & Seeder**:
  - [x] Skema Drizzle ORM PostgreSQL (`users`, `categories`, `items` dengan `jsonb` specs, `loans`, `returns`, `activity_logs`, `notifications`, `settings`).
  - [x] Seeder otomatis: 1 Admin, 2 Petugas, 5 Peminjam, 5 Kategori, 15 Alat (9 Laptop + 6 Lisensi Software).
- [x] **Modul Autentikasi & RBAC**:
  - [x] Login kredensial dengan proteksi throttle, Google OAuth (Firebase Auth), dan pengalih cepat akun demo per role.
  - [x] Proteksi middleware per role & halaman 403 Akses Ditolak.
- [x] **Modul Manajemen User & Kategori (Admin)**:
  - [x] CRUD User lengkap, Soft Delete, Reset Password, dan CRUD Kategori.
- [x] **Modul Manajemen Alat & Lisensi (Admin & Katalog)**:
  - [x] Dukungan penuh Perangkat Keras (kode aset unik, spesifikasi JSONB, kondisi fisik, QR code) & Perangkat Lunak (versi, tipe lisensi, kuota *seat* total/tersedia, tanggal kedaluwarsa & peringatan hampir habis).
- [x] **Modul Peminjaman (Peminjam, Petugas, Admin)**:
  - [x] Validasi kuota aktif (maks 2 laptop & 3 lisensi), validasi durasi (maks 7 hari), deteksi bentrok jadwal, pembatalan, perpanjangan 1x, persetujuan/penolakan petugas, dan cetak bukti peminjaman PDF/Print.
- [x] **Modul Pengembalian & Denda Otomatis**:
  - [x] Verifikasi kondisi fisik oleh petugas, kalkulasi keterlambatan & denda otomatis (Rp 25.000/hari), transisi otomatis ke status `Maintenance` jika perangkat dikembalikan rusak, dan pengembalian kuota *seat* lisensi.
- [x] **Modul Laporan, Ekspor PDF/Excel & Log Aktivitas**:
  - [x] Filter laporan multi-dimensi, ekspor CSV/Excel, cetak PDF resmi, dan rekam jejak audit otomatis beserta alamat IP dan waktu.
