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
(c) **file SQLite yang tidak hilang** saat redeploy/restart.

| Platform | Cocok? | Catatan |
| --- | --- | --- |
| Vercel / Netlify | Hanya front-end | Fungsi serverless tidak punya filesystem persisten untuk SQLite |
| Render (free) | Kurang | Disk free tier bersifat sementara; persistent disk hanya di paket berbayar |
| **Railway + Volume** | **Ya (dipilih)** | Mendukung Dockerfile dan Volume yang di-mount ke path tetap |
| Fly.io + Volume | Ya (alternatif) | Butuh kartu kredit untuk verifikasi |

Karena Express menyajikan hasil build React (`STATIC_DIR`), cukup **satu service**: satu URL, cookie
sesi first-party, dan tidak perlu konfigurasi CORS lintas domain. HTTPS disediakan otomatis oleh Railway.

## 3. Deploy ke Railway

1. Login ke https://railway.com dengan akun GitHub → **New Project → Deploy from GitHub repo** →
   pilih repository ini. Railway mendeteksi `Dockerfile` di root.
2. Buka service → **Settings**:
   - Tambahkan **Volume** (klik kanan kanvas proyek / Command Palette → Volume) dan hubungkan ke
     service ini dengan **Mount path `/data`**.
   - **Networking → Generate Domain** untuk mendapatkan URL publik `https://<nama>.up.railway.app`.
3. **Variables** service:

   | Variabel | Nilai |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | string acak ≥ 32 karakter (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `DB_PATH` | `/data/asramacare.db` |
   | `COOKIE_SECURE` | `true` |
   | `COOKIE_SAMESITE` | `lax` |
   | `CORS_ORIGIN` | URL Railway Anda (opsional karena satu origin) |
   | `ADMIN_NAME` | `Admin Asrama` |
   | `ADMIN_EMAIL` | email admin Anda |
   | `ADMIN_PASSWORD` | password admin yang kuat |
   | `SEED_DEMO` | `true` untuk demo penilaian, `false` untuk penggunaan nyata |
   | `RAILWAY_RUN_UID` | `0` — Volume Railway di-mount sebagai root, sedangkan image berjalan sebagai user `node` |

4. Deploy ulang. Verifikasi:
   ```bash
   curl https://<nama>.up.railway.app/api/health
   ```
   lalu buka URL di browser dan login.
5. Uji persistensi: buat satu laporan, klik **Redeploy**, pastikan laporan masih ada.

Keterbatasan: SQLite cocok untuk satu instance. Jangan menaikkan replika lebih dari 1, karena
setiap replika tidak berbagi file database yang sama. Paket trial Railway memiliki batas kredit.

## 4. Jenkins

`Jenkinsfile` menjalankan: Checkout → Setup (cek Node, pasang Bun bila perlu) → Install dependency
(paralel) → Test back-end → Test front-end → Build front-end → Smoke test server produksi lokal →
Deploy (opsional) → Verifikasi health check URL online.

Langkah:

1. Siapkan Jenkins (lokal atau server) dengan agent yang memiliki **Node.js 22.13+**, `curl`, dan `git`.
   Plugin yang dipakai: Pipeline, Git, JUnit, Credentials Binding, Timestamper.
   Contoh Jenkins lokal dengan Docker:
   ```bash
   docker run -d -p 8080:8080 -v jenkins_home:/var/jenkins_home --name jenkins jenkins/jenkins:lts-jdk21
   ```
   (Image resmi Jenkins tidak berisi Node.js; pasang Node.js di agent atau gunakan plugin NodeJS.)
2. **New Item → Pipeline** → *Pipeline script from SCM* → Git → URL repository GitHub → branch
   `*/main` → Script Path `Jenkinsfile`.
3. Untuk deployment otomatis: buat **Project Token** di Railway (Project Settings → Tokens),
   simpan di Jenkins sebagai kredensial *Secret text* dengan ID `railway-token`.
4. **Build with Parameters**:
   - Pertama kali: `DEPLOY=false` untuk memastikan test dan build lulus.
   - Setelah Railway siap: `DEPLOY=true`, `RAILWAY_SERVICE=<nama service>`, `APP_URL=https://<nama>.up.railway.app`.
5. Simpan tangkapan layar **Stage View** dan **Console Output** sebagai bukti "hasil pengujian
   deployment menggunakan Jenkins". Laporan JUnit dan coverage diarsipkan oleh pipeline.

Catatan: Railway juga dapat melakukan auto-deploy setiap push ke `main`. Jika fitur itu aktif,
tahap Deploy di Jenkins dapat dibiarkan `DEPLOY=false` dan cukup jalankan tahap verifikasi dengan
`APP_URL` setelah Railway selesai deploy.
