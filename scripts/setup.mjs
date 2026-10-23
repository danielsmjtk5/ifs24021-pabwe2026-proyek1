// Menyiapkan proyek sekali jalan: install dependensi, salin .env, buat database SQLite.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// Back-end memakai modul bawaan node:sqlite yang tersedia tanpa flag sejak Node.js 22.13.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error(`Node.js ${process.versions.node} terlalu lama. Pasang Node.js 22.13 atau lebih baru.`);
  process.exit(1);
}

function run(command, dir) {
  console.log(`\n> [${dir}] ${command}`);
  execSync(command, { cwd: path.join(root, dir), stdio: 'inherit', shell: true });
}

for (const dir of ['back-end', 'front-end']) {
  const env = path.join(root, dir, '.env');
  if (!fs.existsSync(env)) {
    fs.copyFileSync(path.join(root, dir, '.env.example'), env);
    console.log(`Membuat ${dir}/.env dari .env.example`);
  }
}

run('npm install', 'back-end');
run('bun install', 'front-end');
run('npm run seed', 'back-end');

console.log('\nSetup selesai. Jalankan: bun run dev  (atau npm run dev)');
