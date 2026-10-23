# AsramaCare — Back-end (Express.js + SQLite)

REST API AsramaCare. Dokumentasi lengkap fitur, endpoint, dan environment ada di
[README utama](../README.md).

## Menjalankan

```bash
npm install
cp .env.example .env
npm run seed     # migrasi + akun admin + data demo (idempoten)
npm run dev      # http://localhost:3000, auto-restart saat file berubah
```

| Script | Fungsi |
| --- | --- |
| `npm start` | Menjalankan server |
| `npm run dev` | Server dengan `node --watch` |
| `npm run migrate` | Hanya menjalankan migrasi |
| `npm run seed` | Migrasi + seed admin (dan demo jika `SEED_DEMO=true`) |
| `npm test` | Seluruh pengujian (Vitest + Supertest) |
| `npm run test:coverage` | Pengujian + laporan coverage (`coverage/`) |
| `npm run test:ci` | Pengujian + coverage + JUnit (`reports/junit.xml`) untuk Jenkins |

## Arsitektur

`routes` → `middlewares` (authenticate/authorize) → `controllers` → `validators` → `services` → SQLite.

- `src/config/database.js` membuka koneksi SQLite lewat modul bawaan `node:sqlite` (`DatabaseSync`, tanpa kompilasi native), mengaktifkan `foreign_keys` dan WAL,
  lalu menjalankan migrasi yang belum tercatat di `schema_migrations`.
- Semua query memakai prepared statement dengan parameter (tidak ada penggabungan string input).
- `src/middlewares/errorHandler.js` mengubah `AppError` menjadi respons JSON, dan menyembunyikan
  detail kesalahan lain (termasuk error database) di balik pesan 500 yang umum.
- Field `status`, `reporter_id`, `id`, dan timestamp tidak pernah dibaca dari body request laporan.

## Pengujian

`tests/setup.js` membuat database SQLite in-memory baru sebelum setiap test, sehingga pengujian
tidak menyentuh `data/asramacare.db`. Cakupan: health, login/registrasi/sesi, validasi input,
CRUD laporan, transisi status, catatan, pembatasan role, akses laporan milik orang lain, privasi
kontak pelapor, 404, simulasi kegagalan database, migrasi/seed idempoten, konfigurasi environment,
dan penyajian build front-end.
