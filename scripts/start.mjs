// Menjalankan AsramaCare mode produksi dari folder root (satu service: API + hasil build React).
// Nilai default di bawah hanya dipakai jika hosting tidak menyediakan variabel tersebut.
import { execFileSync, execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const backEnd = path.join(root, 'back-end');
const env = process.env;

const appUrl = env.APP_URL || '';
const defaults = {
  NODE_ENV: 'production',
  STATIC_DIR: path.join(root, 'front-end', 'dist'),
  DB_PATH: path.join(backEnd, 'data', 'asramacare.db'),
  SEED_DEMO: 'true',
  COOKIE_SAMESITE: 'lax',
  COOKIE_SECURE: env.FORCE_HTTPS === 'true' || appUrl.startsWith('https://') ? 'true' : 'false',
  CORS_ORIGIN: appUrl || 'http://localhost:5173',
  ADMIN_NAME: 'Admin Asrama',
  ADMIN_EMAIL: 'admin@asramacare.test',
};
for (const [key, value] of Object.entries(defaults)) {
  if (!env[key]) env[key] = value;
}
if (!env.ADMIN_PASSWORD) {
  env.ADMIN_PASSWORD = 'Admin12345';
  console.warn('PERINGATAN: ADMIN_PASSWORD tidak diatur, memakai password demo. Atur di environment hosting.');
}

// Jika hosting tidak menjalankan `npm install`/`npm run build`, build sekarang.
const ready = ['back-end/node_modules/express', 'front-end/dist/index.html'].every((p) =>
  fs.existsSync(path.join(root, p)),
);
if (!ready) {
  execSync('node scripts/build.mjs', { cwd: root, stdio: 'inherit', shell: true });
}

// --disable-warning tersedia sejak Node.js 20.11 / 21.3.
const [major, minor] = process.versions.node.split('.').map(Number);
const nodeFlags =
  major > 21 || (major === 21 && minor >= 3) || (major === 20 && minor >= 11)
    ? ['--disable-warning=ExperimentalWarning']
    : [];

console.log(`AsramaCare produksi: Node.js ${process.versions.node}, port ${env.PORT || 3000}, DB ${env.DB_PATH}`);
execFileSync(process.execPath, [...nodeFlags, 'database/seeds/seed.js'], { cwd: backEnd, stdio: 'inherit' });

const server = spawn(process.execPath, [...nodeFlags, 'src/server.js'], { cwd: backEnd, stdio: 'inherit' });
server.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
