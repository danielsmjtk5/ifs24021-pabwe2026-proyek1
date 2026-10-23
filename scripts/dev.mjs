// Menjalankan back-end (http://localhost:3000) dan front-end (http://localhost:5173) bersamaan.
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
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
