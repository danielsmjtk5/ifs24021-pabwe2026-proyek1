// Menjalankan back-end (http://localhost:3000) dan front-end (http://localhost:5173) bersamaan.
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// Jika dependensi belum terpasang (setup belum dijalankan atau gagal), jalankan setup dulu.
const required = ['back-end/node_modules/express', 'front-end/node_modules/vite', 'back-end/.env'];
const missing = required.filter((p) => !fs.existsSync(path.join(root, p)));
if (missing.length > 0) {
  console.log(`Belum lengkap: ${missing.join(', ')}. Menjalankan setup terlebih dahulu...`);
  try {
    execSync('node scripts/setup.mjs', { cwd: root, stdio: 'inherit', shell: true });
  } catch {
    console.error('\nSetup gagal. Perbaiki error di atas, lalu jalankan "bun run setup" lagi.');
    process.exit(1);
  }
}
const apps = [
  { name: 'back-end ', dir: 'back-end', command: 'npm run dev' },
  { name: 'front-end', dir: 'front-end', command: 'bun run dev' },
];

const children = apps.map(({ name, dir, command }) => {
  const child = spawn(command, { cwd: path.join(root, dir), shell: true });
  const prefix = (chunk) =>
    chunk
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => `[${name}] ${line}`)
      .join('\n');
  child.stdout.on('data', (c) => console.log(prefix(c)));
  child.stderr.on('data', (c) => console.error(prefix(c)));
  child.on('exit', (code) => {
    console.log(`[${name}] berhenti (kode ${code}). Menghentikan semua proses.`);
    stopAll();
  });
  return child;
});

let stopping = false;
function stopAll() {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    else child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
console.log('Membuka AsramaCare di http://localhost:5173 (tekan Ctrl+C untuk berhenti)');
