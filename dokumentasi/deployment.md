# Panduan GitHub, Deployment, dan Jenkins — AsramaCare

Dokumen ini berisi langkah yang **masih perlu dilakukan sendiri** oleh pemilik proyek, karena
membutuhkan akun GitHub, akun hosting, dan server Jenkins milik pribadi. Tidak ada URL, status
Jenkins, atau repository yang dianggap sudah ada sebelum langkah ini benar-benar dijalankan.

## 1. Push ke GitHub

Repository lokal sudah diinisialisasi dan memiliki commit awal.

```bash
cd ifs24021-pabwe2026-proyek1
git status                      # pastikan tidak ada file .env atau *.db yang ikut
# buat repository kosong bernama ifs24021-pabwe2026-proyek1 di https://github.com/new (tanpa README)
git remote add origin https://github.com/<username>/ifs24021-pabwe2026-proyek1.git
git branch -M main
git push -u origin main
```

## 2. Pilihan hosting dan alasannya

AsramaCare membutuhkan: (a) static build React, (b) server Node.js/Express yang berjalan terus,
(c) file SQLite. Karena Express menyajikan hasil build React (`STATIC_DIR`), cukup **satu service**:
satu URL, cookie sesi first-party, dan tidak perlu konfigurasi CORS lintas domain.

| Platform | Cocok? | Catatan |
| --- | --- | --- |
| Vercel / Netlify | Hanya front-end | Fungsi serverless tidak punya filesystem untuk SQLite |
| Railway / Render / Fly.io | Ya, tetapi | Meminta kartu kredit untuk verifikasi akun |
| **Delcom (panel kampus, nodejs-express)** | **Ya (dipilih)** | Gratis untuk mahasiswa, deploy dari GitHub, HTTPS + domain `*.s1if.cloud` |
| Hugging Face Spaces (Docker) | Ya (alternatif) | Gratis tanpa kartu kredit, mendukung Dockerfile, HTTPS otomatis |

Keterbatasan Space gratis Hugging Face: storage bersifat **sementara**. Database SQLite dibuat ulang setiap
Space restart/rebuild, lalu seed membuat lagi admin dan data demo (`SEED_DEMO=true`). Ini cukup
untuk demo dan penilaian, tetapi laporan baru akan hilang setelah restart. Space gratis juga
"tidur" bila lama tidak dibuka; kunjungan berikutnya membangunkannya (butuh beberapa detik).
Untuk data permanen bisa menambah *Persistent storage* berbayar (di-mount ke `/data`) atau
memakai hosting lain dengan `Dockerfile` di root.

## 3. Deploy ke Delcom (s1if.cloud)

Panel Delcom meng-clone repository GitHub, menjalankan aplikasi Node.js, dan meneruskan domain
`https://<nama>.s1if.cloud` (nginx) ke `127.0.0.1:$PORT`. Folder root repository sudah siap untuk itu:

| Perintah di root | Fungsi |
| --- | --- |
| `npm install` | `postinstall` → `scripts/build.mjs`: install back-end, install + build front-end (Bun bila ada, jika tidak npm) |
| `npm run build` | sama dengan di atas |
| `npm start` atau `node server.js` | `scripts/start.mjs`: build jika belum, seed admin/demo, jalankan Express di `PORT` yang menyajikan API + React |

`scripts/start.mjs` memberi nilai default produksi bila variabel belum ada: `NODE_ENV=production`,
`STATIC_DIR=front-end/dist`, `DB_PATH=back-end/data/asramacare.db`, `SEED_DEMO=true`,
`COOKIE_SECURE=true` (jika `FORCE_HTTPS=true` atau `APP_URL` https), `CORS_ORIGIN=$APP_URL`,
admin `admin@asramacare.test`. Jika Node.js server lebih lama dari 22.13, build otomatis memasang
`better-sqlite3` sebagai driver SQLite cadangan.

Langkah:

1. Commit dan push semua perubahan ke branch `main` GitHub.
2. Di panel Delcom, pastikan **Teknologi** `nodejs-express` dan **Sumber** repository GitHub ini.
   Jika panel meminta perintah install/build/start, isi `npm install`, `npm run build`, `npm start`.
3. Variabel yang sudah disediakan panel (`PORT`, `JWT_SECRET`, `APP_URL`, `FORCE_HTTPS`) dipakai
   langsung. Tambahkan bila bisa: `ADMIN_PASSWORD` (password admin yang kuat) dan `ADMIN_EMAIL`.
   Tanpa `ADMIN_PASSWORD`, password demo `Admin12345` dipakai dan log menampilkan peringatan.
4. Klik **Redeploy**, tunggu selesai, lalu buka `https://<nama>.s1if.cloud/api/health`.
5. Jika muncul **502 Bad Gateway**, aplikasi belum berjalan di `PORT`. Buka log deploy/aplikasi di
   panel dan cari: error `npm install`/build, `JWT_SECRET wajib diisi`, versi Node.js
   (baris `AsramaCare produksi: Node.js ...`), atau port yang berbeda dari `PORT`.

Database tidak dipilih di panel ("none") karena SQLite berupa file di `back-end/data/`. Jika panel
meng-clone ulang folder saat redeploy, data kembali ke data demo.

## 3b. Alternatif: Hugging Face Spaces

Space tidak berisi seluruh kode. Space hanya berisi dua file dari folder `deploy/huggingface/`
(`Dockerfile` dan `README.md`). Saat build, Dockerfile tersebut meng-clone branch `main` dari
repository GitHub, sehingga **repository GitHub harus public**. Cara ini juga menghindari penolakan
push file biner (screenshot/flowchart) oleh Hugging Face.

1. Buat akun di https://huggingface.co/join (cukup email, tanpa kartu kredit).
2. Buka https://huggingface.co/new-space:
   - **Space name**: `asramacare`
   - **SDK**: **Docker** → template **Blank**
   - **Hardware**: CPU basic (Free), **Public**
   - Klik **Create Space**.
3. Pada tab **Files** Space → **Add file → Create a new file**:
   - Nama `Dockerfile`, isi dengan salinan `deploy/huggingface/Dockerfile` → **Commit**.
   - Buka `README.md` yang sudah ada → **Edit**, ganti seluruh isinya dengan
     `deploy/huggingface/README.md` → **Commit**. Baris `sdk: docker` dan `app_port: 7860` wajib ada.
   - Jika repository GitHub Anda bukan `danielsmjtk5/ifs24021-pabwe2026-proyek1`, ubah baris
     `ARG REPO=...` di Dockerfile.
4. **Settings → Variables and secrets** → **New secret** untuk:

   | Nama | Nilai |
   | --- | --- |
   | `JWT_SECRET` | string acak ≥ 32 karakter (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `ADMIN_EMAIL` | email admin, mis. `admin@asramacare.test` |
   | `ADMIN_PASSWORD` | password admin (min. 8 karakter) |

   Nilai lain sudah diatur di Dockerfile: `NODE_ENV=production`, `PORT=7860`,
   `DB_PATH=/data/asramacare.db`, `SEED_DEMO=true`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`,
   `FRAME_ANCESTORS=https://huggingface.co` (agar aplikasi bisa tampil di dalam halaman Space).
   Jika perlu, nilai tersebut bisa ditimpa lewat **New variable**.
5. Setelah secret disimpan, Space membangun ulang (tab **Logs → Build**). Tunggu status **Running**.
6. URL aplikasi: `https://<username>-asramacare.hf.space` (tombol **⋮ → Embed this Space** juga
   menampilkannya). Verifikasi:
   ```bash
   curl https://<username>-asramacare.hf.space/api/health
   ```
   lalu login. Sebaiknya buka URL `.hf.space` tersebut langsung, karena sebagian browser memblokir
   cookie di dalam iframe halaman huggingface.co.
7. Setiap ada push baru ke GitHub, Space perlu dibangun ulang: **Settings → Factory rebuild**,
   atau otomatis lewat Jenkins (bagian 4).

Keterbatasan: SQLite cocok untuk satu instance. Jangan menjalankan lebih dari satu replika.

## 4. Jenkins + webhook GitHub (CI/CD)

`Jenkinsfile` menjalankan: Checkout → Setup (memasang Node.js 22 dan Bun bila agent belum punya)
→ Install dependency (paralel) → Test back-end → Test front-end → Build front-end → Smoke test
server produksi lokal → Deploy (redeploy Delcom, atau rebuild Space Hugging Face) → Verifikasi
health check URL online.
Blok `triggers { githubPush() }` membuat pipeline berjalan otomatis setiap ada push ke GitHub.

Alur CI/CD: `git push` → GitHub mengirim webhook ke Jenkins → Jenkins test + build → Jenkins
memanggil redeploy Delcom → Delcom meng-clone commit terbaru dan menjalankan `npm start` →
Jenkins memeriksa `/api/health`.

Langkah (contoh memakai Jenkins kampus `https://jenkins.delcom.org`):

1. Agent Jenkins cukup memiliki `sh`, `git`, `curl`, dan `tar`. Plugin yang dipakai: Pipeline, Git,
   GitHub, JUnit, Credentials Binding, Timestamper.
2. **New Item → Pipeline** → *Pipeline script from SCM* → Git → URL repository GitHub → branch
   `*/main` → Script Path `Jenkinsfile`. Centang **GitHub hook trigger for GITScm polling** (opsi
   ini juga aktif otomatis setelah build pertama karena `githubPush()` di Jenkinsfile).
3. Di GitHub: repository → **Settings → Webhooks → Add webhook**:
   - **Payload URL**: `https://jenkins.delcom.org/github-webhook/` (garis miring di akhir wajib)
   - **Content type**: `application/json`
   - **Which events**: *Just the push event* → **Add webhook**.
   - Cek tab **Recent Deliveries**: respons 200 berarti Jenkins menerima webhook.
4. Untuk deploy otomatis ke Delcom, buat dua kredensial *Secret text* di Jenkins (Manage Jenkins →
   Credentials, atau di folder/job Anda), **jangan** ditulis di repository:
   - ID **`delcom-website-id`** berisi `WEBSITE_ID` dari panel Delcom.
   - ID **`delcom-deploy-token`** berisi `DEPLOY_TOKEN` dari panel Delcom.

   Tahap *Deploy ke Delcom* mengirim POST ke `URL_REDEPLOY` (JSON `website_id` + `token`, juga
   header `Authorization: Bearer`), memantau `URL_PROGRESS`, lalu *Verify Deployment* memeriksa
   `APP_URL/api/health`. Jika format API Delcom berbeda (lihat contoh dari dosen/asisten atau
   dokumentasi panel), sesuaikan perintah `curl` di tahap tersebut.

   Untuk Hugging Face: pilih `DEPLOY_TARGET=huggingface`, isi `HF_SPACE`, dan buat kredensial
   `hf-token` (access token tipe **Write**).
5. Jalankan **Build Now** sekali secara manual (agar Jenkins membaca parameter dan trigger),
   setelah itu cukup `git push`.
6. Simpan tangkapan layar **Stage View**, **Console Output**, dan **Recent Deliveries** webhook
   sebagai bukti "hasil pengujian deployment menggunakan Jenkins". Laporan JUnit dan coverage
   diarsipkan oleh pipeline.

Untuk menjalankan CI saja (test + build tanpa deploy), jalankan **Build with Parameters** dengan
`DEPLOY=false`.
