# FASE 1 — RISET DESAIN (DESIGN RESEARCH)

## 1. Tujuan Riset
Menentukan pola antarmuka, hierarki informasi, dan perlakuan visual untuk **INVENTRA — Aplikasi Peminjaman Laptop & Perangkat Lunak** agar memiliki karakter produk laboratorium perangkat keras yang fungsional, cepat dipindai, dan bebas dari klise desain AI generik.

## 2. Analisis Produk & Referensi Relevan

### A. Linear (linear.app) — Operational Issue & Workspace Console
- **Apa yang membuatnya khas**: Kanvas gelap grafit berpresisi tinggi (`#090D16` / `#0F1623`), pemisahan kontainer menggunakan garis struktur `1px` dengan kontras terukur, navigasi keyboard cepat, dan kepadatan tabel tinggi tanpa terasa sesak.
- **Prinsip yang diambil**:
  - Satu tingkat elevasi (*single-elevation depth*) pada seluruh dashboard dan tabel.
  - Kontras teks putih murni (`#F8FAFC`) untuk judul/nilai utama dan slate redup (`#94A3B8`) untuk metadata sekunder.
  - Respon mikro-interaksi cepat ($\le 150\text{ms}$).

### B. Teenage Engineering & Framework Laptop Marketplace (frame.work)
- **Apa yang membuatnya khas**: Memperlakukan spesifikasi perangkat keras seperti lembar spesifikasi teknis (*datasheet*) — kode part monospace, diagram modular, transparansi status ketersediaan komponen, dan fotografi produk berlatar gelap.
- **Prinsip yang diambil**:
  - Kode aset unik (`HW-MBP16-01`, `SW-ADOBE-01`) menggunakan font monospace (`JetBrains Mono`) dengan `tabular-nums`.
  - Spesifikasi JSONB (CPU, RAM, GPU, Storage, Serial Number) ditampilkan dalam matriks teknis terstruktur, bukan paragraf panjang.
  - Label QR Code terintegrasi pada setiap unit fisik dan bukti peminjaman.

### C. Snipe-IT & Shelf.nu — Open-Source IT Asset & License Management
- **Apa yang membuatnya khas**: Memisahkan secara tegas antara **Hardware Assets** (dilacak per nomor seri dan kondisi fisik: Baik, Rusak Ringan, Rusak Berat, Maintenance) dan **Software Licenses** (dilacak per kuota *Seat Total* vs *Seat Tersedia* serta tanggal kedaluwarsa).
- **Prinsip yang diambil**:
  - Indikator kapasitas *seat* lisensi berbentuk bar progres horizontal presisi.
  - Peringatan otomatis untuk lisensi perangkat lunak yang mendekati tanggal kedaluwarsa.
  - Alur *Check-out* (Persetujuan Pinjam) dan *Check-in* (Inspeksi Pengembalian + Perhitungan Denda Otomatis).

### D. Vercel Dashboard — Technical Telemetry & Audit Log
- **Apa yang membuatnya khas**: Tampilan log aktivitas real-time yang bersih, filter multi-dimensi dalam satu baris toolbar, dan penggunaan warna aksen biru elektrik yang hemat namun tegas.
- **Prinsip yang diambil**:
  - Aturan warna 60-30-10: 60% grafit gelap, 30% permukaan panel & garis struktur, 10% aksen biru elektrik (`#3B82F6`) & indikator status semantik.
