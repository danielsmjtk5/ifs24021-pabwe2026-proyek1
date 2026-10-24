# Naskah Video YouTube — Menjalankan AsramaCare di Komputer Lokal

Durasi target: 8–12 menit. Rekam layar penuh (OBS / Xbox Game Bar), tampilkan terminal dan browser.
Semua perintah di bawah sudah diuji pada repository ini.

## 0. Pembuka (±30 detik)
"Halo, saya Albert, NIM ... . Pada video ini saya menunjukkan cara menjalankan AsramaCare, aplikasi
pelaporan kerusakan fasilitas asrama, dari clone repository GitHub hingga aplikasi berjalan di
komputer lokal. Back-end memakai Express.js dan SQLite, front-end memakai React."

## 1. Prasyarat (±30 detik)
Tampilkan versi:
```bash
git --version
node -v      # 20 atau lebih baru
bun -v       # 1.x
```

## 2. Clone kedua repository (±30 detik)
```bash
git clone https://github.com/<username>/ifs24021-pabwe2026-proyek1-backend.git
git clone https://github.com/<username>/ifs24021-pabwe2026-proyek1.git
```
Jelaskan bahwa back-end (REST API) dan front-end (React) berada di dua repository terpisah.

## 3. Instalasi dependensi back-end (±1 menit)
```bash
cd ifs24021-pabwe2026-proyek1-backend
bun install
```

## 4. Konfigurasi environment (±1 menit)
```bash
cp .env.example .env
```
Buka `.env`, jelaskan `PORT`, `DATABASE_URL` (lokal: file SQLite; produksi Vercel: Turso), `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
Tekankan bahwa `.env` tidak di-commit ke GitHub.

## 5. Inisialisasi SQLite (±1 menit)
```bash
bun run seed
```
Tunjukkan output "Seed selesai ..." dan file `data/asramacare.db` yang terbentuk.
Jelaskan tabel `users`, `reports`, `report_history` di `database/migrations/001_init.sql`.

## 6. Menjalankan back-end (±1 menit)
```bash
bun run dev
```
Buka http://localhost:3000/api/health di browser → status ok.
(Opsional) Jalankan `bun run test` di terminal lain untuk memperlihatkan 91 test lulus.

## 7. Menjalankan front-end (±1 menit)
Terminal baru:
```bash
cd ifs24021-pabwe2026-proyek1
bun install
cp .env.example .env
bun run dev
```
Buka http://localhost:5173.

## 8. Demonstrasi fitur (±4 menit)
1. Login gagal (password salah) → pesan error. Lalu login sebagai penghuni `budi@asramacare.test` / `Penghuni123`.
2. Dashboard: kartu statistik dari database, laporan terbaru, ringkasan status.
3. Buat laporan baru: coba kirim kosong (validasi), lalu isi lengkap → toast sukses → halaman detail + riwayat.
4. Semua Laporan: pencarian "lampu", filter status/kategori, urutkan prioritas.
5. Laporan Saya → buka laporan menunggu → Ubah → simpan.
6. Logout → login admin `admin@asramacare.test` / `Admin12345`.
7. Kelola Laporan → buka laporan baru tadi → Ubah status ke Diproses dengan catatan → riwayat bertambah.
8. Tambah catatan tindak lanjut; lalu ubah ke Selesai.
9. Login kembali sebagai Budi → status laporan sudah Selesai, tombol ubah/hapus tidak tersedia.
10. Profil: ubah nama kamar.

## 9. Penutup (±30 detik)
"Data tersimpan di SQLite sehingga tetap ada setelah server dimatikan dan dijalankan lagi."
Matikan back-end (Ctrl+C), jalankan `bun run dev` lagi, refresh → data masih ada. Terima kasih.
