# FASE 2 — CREATIVE DIRECTION (DARK HARDWARE LAB)

## 1. Konsep Desain & Identitas Visual
**Arah Desain Terpilih**: **"Dark Hardware Lab"** — Ruang kendali inventaris perangkat keras dan lisensi perangkat lunak berlatar gelap grafit teknis dengan tipografi putih kontras tinggi dan aksen biru elektrik elegan.

Berbeda dari template SaaS generik yang penuh dekorasi mengambang, **INVENTRA** dirancang layaknya instrumen laboratorium komputer profesional: setiap piksel menyajikan status aset, spesifikasi perangkat, kuota kursi lisensi, atau antrean verifikasi.

## 2. Target Pengguna & Perilaku Operasional
1. **Peminjam (Mahasiswa / Peneliti / Staf)**:
   - *Perilaku*: Ingin cepat memfilter laptop berdasarkan RAM/GPU atau mencari lisensi software tertentu, memeriksa ketersediaan tanggal, mengajukan pinjaman dalam < 30 detik, dan mengunduh slip bukti peminjaman PDF.
2. **Petugas Laboratorium (Operator Harian)**:
   - *Perilaku*: Memproses antrean pengajuan (`Menunggu`), memeriksa riwayat peminjam, menyetujui/menolak dengan alasan jelas, serta memverifikasi fisik alat saat dikembalikan (menghitung denda Rp 25.000/hari dan mengalihkan unit rusak ke status `Maintenance`).
3. **Admin (Kepala Laboratorium)**:
   - *Perilaku*: Mengelola data induk (User, Kategori, Alat & Lisensi), mengatur parameter kebijakan lab, memantau grafik utilitas dari database PostgreSQL nyata, dan mengaudit Log Aktivitas.

## 3. Palet Warna (60-30-10 Discipline)
- **60% Kanvas Utama (Dominant Neutral)**:
  - `Canvas Primary`: `#090D16` (Obsidian Hardware Lab)
  - `Canvas Secondary`: `#0F1623` (Deep Graphite Surface)
- **30% Struktur & Tipografi**:
  - `Panel Surface`: `#151E2E`
  - `Hairline Border`: `#1E293B` (Hover/Active: `#334155`)
  - `Text Primary`: `#F8FAFC` (Crisp Technical White)
  - `Text Secondary`: `#94A3B8` (Muted Slate)
- **10% Aksen & Status Semantik**:
  - `Primary Electric Blue`: `#3B82F6` (Hover: `#2563EB`, Glow Halus: `rgba(59, 130, 246, 0.14)`)
  - `Status Tersedia / Disetujui`: Emerald `#10B981`
  - `Status Sedang Dipinjam`: Electric Blue `#3B82F6`
  - `Status Menunggu`: Amber `#F59E0B`
  - `Status Terlambat / Ditolak / Kedaluwarsa`: Crimson `#EF4444`
  - `Status Maintenance`: Signal Orange `#F97316`

## 4. Pasangan Tipografi (2+1 Font Rule)
- **Display & Heading**: `Outfit` (SemiBold 600, Bold 700) — Tegas, teknis, dan modern.
- **Body & Form UI**: `Plus Jakarta Sans` (Regular 400, Medium 500, SemiBold 600) — Nyaman dibaca pada tabel padat.
- **Monospace Data & Kode Aset**: `JetBrains Mono` (`tabular-nums`) — Wajib untuk kode aset (`HW-MBP16-01`), kode transaksi (`INV-202611-001`), tanggal, kuota *seat*, dan nominal Rupiah.
