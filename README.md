# AsramaCare — Front-end

Antarmuka web AsramaCare (sistem pelaporan kerusakan fasilitas asrama), dibangun dengan React (JavaScript),
Vite, Bun, React Router, Redux Toolkit, Tailwind CSS v4, Tabler Icons, dan SweetAlert2 mengikuti pola
Modul Praktikum PABWE P4.

Front-end ini memakai REST API AsramaCare dari repository back-end terpisah
(`ifs24021-pabwe2026-proyek1-backend`).

## Menjalankan di lokal

1. Jalankan back-end terlebih dahulu (lihat README repository back-end), default di `http://localhost:3000`.
2. Jalankan front-end:

```bash
git clone <url-repo-front-end>
cd ifs24021-pabwe2026-proyek1
bun install
cp .env.example .env
bun run dev      # http://localhost:5173, request /api diteruskan ke back-end lokal
```

## Environment

| Variabel | Keterangan |
| --- | --- |
| `VITE_API_BASE_URL` | URL API back-end, diakhiri `/api`. Lokal: `/api` (lewat proxy Vite). Produksi: URL back-end di Vercel, misalnya `https://ifs24021-pabwe2026-proyek1-backend.vercel.app/api`. |
| `VITE_DEV_PROXY_TARGET` | Alamat back-end lokal untuk proxy saat `bun run dev`. |

Nilai `VITE_*` dibaca saat build, jadi isi variabel ini di environment hosting **sebelum** build.

## Script

| Script | Fungsi |
| --- | --- |
| `bun run dev` | Server development Vite |
| `bun run build` | Build produksi ke `dist/` |
| `bun run preview` / `bun run start` | Menyajikan hasil build |
| `bun run test` | Seluruh pengujian Vitest |
| `bun run test:coverage` | Pengujian + coverage (`coverage/lcov.info`) |

## CI/CD

`Jenkinsfile` dan `sonar-project.properties` mengikuti panduan Delcom CI/CD praktikum
(checkout → install → test + coverage → Trivy → SonarQube → Quality Gate → package → publish → deploy).

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

## Masalah yang diselesaikan

Laporan kerusakan di asrama sering disampaikan secara lisan atau lewat grup chat, sehingga mudah
terlewat, tidak jelas statusnya, dan tidak ada riwayat penanganan. AsramaCare menyediakan satu tempat
untuk membuat laporan terstruktur (kategori, lokasi, prioritas), memantau statusnya
(Menunggu → Diproses → Selesai/Ditolak), dan melihat riwayat serta catatan tindak lanjut dari admin.

## Fitur dan peran

| Fitur | Penghuni | Admin |
| --- | :---: | :---: |
| Login, logout, registrasi akun penghuni | ✅ | ✅ (login) |
| Dashboard statistik dari database | laporan sendiri | seluruh laporan |
| Daftar laporan + pencarian, filter (kategori, prioritas, status, tanggal), urutan, pagination | ✅ | ✅ |
| Membuat laporan kerusakan | ✅ | – |
| Melihat detail + riwayat status | ✅ | ✅ |
| Mengubah/menghapus laporan sendiri selama status **Menunggu** | ✅ | – |
| Mengubah status (dengan aturan transisi) + catatan | – | ✅ |
| Menambah catatan tindak lanjut | – | ✅ |
| Menghapus laporan apa pun | – | ✅ |
| Melihat kontak pelapor (email, kamar) | hanya miliknya | ✅ |
| Profil + ganti password | ✅ | ✅ |

Aturan transisi status: `menunggu → diproses | ditolak`, `diproses → selesai | ditolak`.
Status `selesai` dan `ditolak` bersifat final. Penolakan wajib menyertakan alasan.

Registrasi publik **selalu** membuat akun `penghuni`. Akun admin hanya dibuat melalui seed
(`npm run seed`) menggunakan `ADMIN_EMAIL` dan `ADMIN_PASSWORD` dari environment.

### Akun demo (hanya untuk development)

Dibuat oleh `npm run seed` dengan nilai dari `.env.example`:

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@asramacare.test` | `Admin12345` |
| Penghuni | `budi@asramacare.test` | `Penghuni123` |
| Penghuni | `sari@asramacare.test` | `Penghuni123` |

Di produksi, ganti `ADMIN_EMAIL`/`ADMIN_PASSWORD` dan set `SEED_DEMO=false`.

