# FASE 8 — KRITIK & PENYEMPURNAAN DESAIN (DESIGN REVIEW)

## 1. Evaluasi Hierarki & Komposisi
- **Temuan Awal**: Tampilan katalog dan dashboard berisiko terlihat seragam jika keduanya menggunakan kartu 3 kolom yang identik.
- **Perbaikan yang Diterapkan**:
  - **Katalog Publik / Daftar Alat**: Menggunakan layout *Hardware Datasheet Matrix* dengan filter vertikal/baris spesifikasi, foto perangkat studio `4:3`, indikator kapasitas *seat* lisensi horizontal, dan modal lembar spesifikasi (*Technical Spec Sheet & QR Code*).
  - **Dashboard Per Role**:
    - *Admin*: Menampilkan metrik kesehatan inventaris, peringatan lisensi hampir habis, grafik distribusi peminjaman per kategori, dan log audit terbaru.
    - *Petugas*: Memprioritaskan **Antrean Persetujuan** dan **Inspeksi Pengembalian & Kalkulator Denda Otomatis** di bagian teratas agar operator dapat langsung bekerja tanpa *scrolling* jauh.
    - *Peminjam*: Menampilkan kuota pinjaman aktif (`X/2 Laptop`, `Y/3 Lisensi`), status pengajuan berjalan, dan tombol cetak **Slip Bukti Peminjaman PDF**.

## 2. Verifikasi Interaksi & Keadaan (States)
- Seluruh form (Pengajuan Pinjam, Tambah/Edit Alat, Kategori, Pengguna, Verifikasi Pengembalian, Penolakan dengan Alasan, Pengaturan Kebijakan) memiliki validasi *inline* dan umpan balik status yang nyata ke PostgreSQL.
- Halaman Error **403 Akses Ditolak** dan **404 Halaman/Data Tidak Ditemukan** dirancang menyatu dengan estetika *Dark Hardware Lab*.
