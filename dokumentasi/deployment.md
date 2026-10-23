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

## 3. Deploy ke Delcom (s1if.cloud) lewat Jenkins

Mengikuti panduan **Delcom CI/CD**: website di panel Delcom dibuat dengan **Sumber `none`**, lalu
Jenkins yang mengirim paket aplikasi (`latest-app.zip`) ke API redeploy Delcom. Jangan memakai
Sumber `git` bersamaan dengan Jenkins (deploy gagal dengan `destination path '.' already exists`).

### 3.1 Panel Delcom

1. **Domain → Tambah**: buat domain, mis. `ifs24021-pabwe2026-proyek1` (paket `s1if.cloud`).
2. **Website → Tambah**: pilih domain tersebut, **Teknologi** `nodejs-express`, **Database** `none`
   (SQLite berupa file), **Sumber** `none`, lalu **Deploy**.
3. Buka website → salin **Konfigurasi Deploy** (`URL_PROGRESS`, `URL_REDEPLOY`, `WEBSITE_ID`,
   `DEPLOY_TOKEN`) untuk Jenkins. Token ini rahasia: jangan ditulis di repository.
4. Tab **.env** website: biarkan isian bawaan panel (`PORT`, `APP_URL`, `JWT_SECRET`, `FORCE_HTTPS`, ...)
   dan tambahkan:
   ```
   NODE_ENV=production
   ADMIN_EMAIL=admin@asramacare.test
   ADMIN_PASSWORD=<password admin yang kuat>
   SEED_DEMO=true
   ```
   `scripts/start.mjs` membaca `.env` di root ini.

Paket dari Jenkins sudah berisi `front-end/dist` (penanda `front-end/dist/.prebuilt`), sehingga di
server cukup `npm install` (memasang dependensi back-end) lalu `npm start` / `node server.js`.
`scripts/start.mjs` memberi default produksi: `STATIC_DIR=front-end/dist`,
`DB_PATH=back-end/data/asramacare.db`, `COOKIE_SECURE=true` (karena `FORCE_HTTPS=true`),
`CORS_ORIGIN=$APP_URL`. Bila Node.js server < 22.13, `better-sqlite3` dipasang sebagai driver cadangan.

Jika website menampilkan **502 Bad Gateway**: buka log deploy di panel (atau Console Output tahap
*Deploy Application* di Jenkins, yang mencetak `data.log` saat gagal) dan cari error `npm install`,
`JWT_SECRET wajib diisi`, versi Node.js (`AsramaCare produksi: Node.js ...`), atau port.

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
7. Setiap ada push baru ke GitHub, Space perlu dibangun ulang: **Settings → Factory rebuild**.

Keterbatasan: SQLite cocok untuk satu instance. Jangan menjalankan lebih dari satu replika.

## 4. Jenkins Delcom + webhook GitHub + SonarQube (CI/CD)

`Jenkinsfile` mengikuti struktur panduan Delcom (setiap tahap berjalan di container Docker):

| Tahap | Image | Isi |
| --- | --- | --- |
| Checkout | `oven/bun:alpine` | `checkout scm` |
| Install Dependencies | `oven/bun:alpine`, `node:24-alpine` | `bun install` front-end, `npm ci` back-end (paralel) |
| Test | `node:24-alpine` | Vitest + coverage kedua aplikasi, laporan JUnit, lcov untuk SonarQube |
| Build & Smoke Test | `node:24-alpine` | build React, jalankan server produksi, cek `/api/health` dan halaman utama |
| Trivy Security Scan | `aquasec/trivy:0.74.0` | gagal bila ada kerentanan HIGH/CRITICAL |
| SonarQube Analysis + Quality Gate | `sonarsource/sonar-scanner-cli` | memakai `sonar-project.properties` |
| Package / Publish Application | `node:24-alpine` | `latest-app.zip` → userContent Jenkins → `ARTIFACT_URL` |
| Deploy Application | `curlimages/curl` | POST `URL_REDEPLOY` (`token_access`, `website_id`, `source_url`, `source_type: jenkins`), polling `URL_PROGRESS` sampai `SUCCESS`/`FAIL` |
| Verify Deployment | `curlimages/curl` | opsional, cek `APP_URL/api/health` |

Langkah (Jenkins: Delcom → **Redirect Website → Jenkins**):

1. **GitHub webhook**: repository → **Settings → Webhooks → Add webhook** → Payload URL
   `https://jenkins.delcom.org/github-webhook/`, Content type `application/json`, centang
   *Enable SSL verification*, *Just the push event*, *Active* → **Add webhook**.
2. **Credentials** Jenkins (foto profil → Credentials → Add Credentials): *Username with password*,
   username GitHub (centang *Treat username as secret*), password = token GitHub, ID
   `github-<username-github>`.
3. **New Item** → nama sama dengan repository (`ifs24021-pabwe2026-proyek1`) → **Pipeline**.
4. **Configure**:
   - Centang **Prepare an environment for the run** → *Properties Content* diisi Konfigurasi Deploy
     dari panel Delcom, ditambah `APP_URL` untuk tahap verifikasi:
     ```
     URL_PROGRESS=https://delcom.org/api/dws/websites/progress
     URL_REDEPLOY=https://delcom.org/api/dws/websites/redeploy
     WEBSITE_ID=<website id>
     DEPLOY_TOKEN=<token access>
     APP_URL=https://ifs24021-pabwe2026-proyek1.s1if.cloud
     ```
   - Trigger: centang **GitHub hook trigger for GITScm polling**.
   - Pipeline: *Pipeline script from SCM* → Git → URL repository → credentials dari langkah 2 →
     Branch Specifier `*/main` → Script Path `Jenkinsfile`, centang *Lightweight checkout* → **Save**.
5. **SonarQube** (Delcom → Redirect Website → SonarQube): **Create a local project** dengan project
   key/display name `ifs24021-pabwe2026-proyek1`, main branch `main`, *Follows the instance's
   default* → **Create project**. Lalu **Project Settings → Webhooks → Create**: Name `Jenkins`,
   URL `http://cicd-jenkins:8080/sonarqube-webhook/`. Jika kriteria *SonarQube Grading* meminta
   nama proyek lain, ubah `sonar.projectKey`/`sonar.projectName` di `sonar-project.properties`.
6. Push ke GitHub → Jenkins otomatis membuat job baru → lihat **Pipeline Overview**.
7. Pengumpulan: pada konten kursus **Jenkins Grading** dan **SonarQube Grading**, cek kriteria nama
   job/repo/proyek, lalu klik **Sinkronisasi Hasil**. Jika konten kursus menyediakan isi
   `Jenkinsfile` atau `sonar-project.properties` khusus, gunakan isi tersebut.
8. Simpan tangkapan layar Pipeline Overview, Console Output, hasil SonarQube, dan Recent Deliveries
   webhook sebagai bukti untuk laporan.

Hasil verifikasi lokal sebelum pengumpulan (bukan di server Delcom): Trivy 0.74.0 menemukan 0
kerentanan HIGH/CRITICAL; SonarQube Community (analisis lokal) melaporkan 0 bug, 0 vulnerability,
0 code smell, rating A, coverage 99,8%, Quality Gate **Passed**.
