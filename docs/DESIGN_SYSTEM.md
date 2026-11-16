# FASE 5 — DESIGN SYSTEM & ATURAN ANTI-AI-SLOP

## 1. Token Warna & Permukaan
| Token | Nilai Hex | Penggunaan |
|---|---|---|
| `--bg-canvas` | `#090D16` | Latar belakang utama seluruh halaman |
| `--bg-surface` | `#0F1623` | Sidebar, header, dan kontainer tabel |
| `--bg-elevated` | `#162032` | Baris tabel saat hover, modal, dan form input |
| `--border-subtle` | `#1E293B` | Garis pembatas struktural `1px` |
| `--accent-blue` | `#3B82F6` | Tombol aksi utama, indikator tab aktif, fokus input |
| `--text-primary` | `#F8FAFC` | Judul, nama alat, angka metrik utama |
| `--text-muted` | `#94A3B8` | Label kolom, metadata spesifikasi sekunder |

## 2. Disiplin Zero-Pill & Metadata
- **Metadata Statis**: Kategori, spesifikasi teknis (`Apple M3 Max · 64GB Unified · 2TB NVMe`), dan tanggal ditulis sebagai teks bersih dengan pemisah `·` atau `/`, tanpa dibungkus kapsul warna-warni.
- **Badge Status Peminjaman & Alat**: Hanya status operasional (`Menunggu`, `Disetujui`, `Sedang Dipinjam`, `Dikembalikan`, `Terlambat`, `Ditolak`, `Maintenance`) yang menggunakan penanda status berteks eksplisit dengan ikon semantik agar ramah bagi pengguna buta warna.

## 3. Aturan Anti-AI-Slop yang Diterapkan
1. Tidak ada gradasi ungu-biru generik atau dekorasi neon cyberpunk.
2. Tidak ada efek *glassmorphism* buram yang mengganggu keterbacaan tabel.
3. Tidak ada garis aksen kiri tebal (`border-l-4`) pada kartu atau pemberitahuan.
4. Tidak ada titik hijau berkedip (`animate-pulse`) dekoratif pada teks statis.
5. Seluruh angka statistik di dashboard dihitung secara *real-time* dari baris tabel PostgreSQL (`items`, `loans`, `returns`, `users`).
