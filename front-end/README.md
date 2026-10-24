# AsramaCare — Front-end (React + Vite + Bun)

Antarmuka web AsramaCare. Dokumentasi lengkap ada di [README utama](../README.md).

## Menjalankan

```bash
bun install
cp .env.example .env
bun run dev      # http://localhost:5173 (back-end harus berjalan di :3000)
```

| Script | Fungsi |
| --- | --- |
| `bun run dev` | Server development Vite (proxy `/api` → back-end) |
| `bun run build` | Build produksi ke `dist/` |
| `bun run preview` | Pratinjau hasil build |
| `bun run test` | Seluruh pengujian Vitest |
| `bun run test:coverage` | Pengujian + coverage (`coverage/`) |
| `bun run test:ci` | Pengujian + coverage + JUnit untuk Jenkins |

## Struktur

- `src/helpers/apiHelper.js` — pemanggil API terpusat: base URL dari `VITE_API_BASE_URL`,
  serialisasi JSON, `credentials: 'include'` untuk cookie sesi, normalisasi error (`ApiError`),
  dan handler 401 untuk sesi kedaluwarsa.
- `src/helpers/toolsHelper.js` — label kategori/prioritas/status, format tanggal, dan validasi
  formulir yang aturannya sama dengan back-end.
- `src/hooks/useInput.js` — hook input sesuai pola Modul Praktikum P4.
- `src/app/store.js` — Redux store (`auth`, `reports`, `dashboard`).
- `src/features/<fitur>/{api,states,pages,components,modals,layouts}` — kode per fitur.
  Operasi asinkron memakai `createAsyncThunk`; state formulir disimpan lokal di komponen.
- `src/components/RouteGuards.jsx` — `RequireAuth`, `RequireRole`, `GuestOnly` (hanya untuk UX;
  keamanan sebenarnya di back-end).

## Route

| Path | Akses |
| --- | --- |
| `/auth/login`, `/auth/register` | tamu |
| `/` | dashboard (login) |
| `/reports`, `/reports/:id`, `/my-reports` | login |
| `/reports/new`, `/reports/:id/edit` | penghuni |
| `/profile` | login |
| `/admin/reports` | admin |
| lainnya | halaman 404 |
