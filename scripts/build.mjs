// Build produksi dari folder root (dipakai hosting seperti Delcom lewat `npm install` atau `bun install`):
// memasang dependensi back-end, lalu memasang dependensi dan mem-build front-end ke front-end/dist.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function run(command, dir) {
  console.log(`\n> [${dir}] ${command}`);
  execSync(command, { cwd: path.join(root, dir), stdio: 'inherit', shell: true });
}

function hasCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

// Server Delcom teknologi bun-express hanya punya Bun (tanpa npm), jadi Bun dipakai bila npm tidak ada.
const isBun = Boolean(process.versions.bun);
const useNpm = !isBun && hasCommand('npm');
console.log(isBun ? `Bun ${process.versions.bun}` : `Node.js ${process.versions.node}`);
run(useNpm ? 'npm install --no-audit --no-fund' : 'bun install', 'back-end');

// Node.js < 22.13 belum punya node:sqlite tanpa flag: pasang better-sqlite3 (binary siap pakai di Linux).
// Bun sudah menyediakan node:sqlite sendiri.
try {
  await import('node:sqlite');
} catch {
  console.log('node:sqlite tidak tersedia, memasang better-sqlite3 sebagai driver cadangan');
  run('npm install --no-save --no-audit --no-fund better-sqlite3@^12', 'back-end');
}

// Paket dari Jenkins (latest-app.zip) sudah berisi front-end/dist hasil build beserta penanda .prebuilt.
const prebuilt = path.join(root, 'front-end', 'dist', '.prebuilt');
if (fs.existsSync(prebuilt) && fs.existsSync(path.join(root, 'front-end', 'dist', 'index.html'))) {
  console.log('front-end/dist sudah di-build oleh Jenkins, build front-end dilewati');
} else if (hasCommand('bun')) {
  // Bun dipakai jika ada; jika tidak, npm dengan package-lock.json front-end.
  run('bun install --frozen-lockfile', 'front-end');
  run('bun run build', 'front-end');
} else {
  run('npm ci --include=dev --no-audit --no-fund', 'front-end');
  run('npm run build', 'front-end');
}

console.log(`\nBuild selesai. Jalankan: ${isBun ? 'bun run start' : 'npm start'}`);
