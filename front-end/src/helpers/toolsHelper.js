export const CATEGORIES = [
  { value: 'air_sanitasi', label: 'Air & Sanitasi' },
  { value: 'listrik', label: 'Listrik & Pencahayaan' },
  { value: 'kamar_furnitur', label: 'Kamar & Furnitur' },
  { value: 'fasilitas_umum', label: 'Fasilitas Umum' },
  { value: 'internet', label: 'Internet & Jaringan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const PRIORITIES = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'tinggi', label: 'Tinggi' },
  { value: 'darurat', label: 'Darurat' },
];

export const STATUSES = [
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
];

const labelOf = (list, value) => list.find((item) => item.value === value)?.label || value || '-';

export const categoryLabel = (value) => labelOf(CATEGORIES, value);
export const priorityLabel = (value) => labelOf(PRIORITIES, value);
export const statusLabel = (value) => labelOf(STATUSES, value);

export const STATUS_STYLES = {
  menunggu: 'bg-amber-50 text-amber-700 ring-amber-200',
  diproses: 'bg-blue-50 text-blue-700 ring-blue-200',
  selesai: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ditolak: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const PRIORITY_STYLES = {
  rendah: 'bg-slate-100 text-slate-600 ring-slate-200',
  sedang: 'bg-sky-50 text-sky-700 ring-sky-200',
  tinggi: 'bg-orange-50 text-orange-700 ring-orange-200',
  darurat: 'bg-red-600 text-white ring-red-600',
};

export function formatDate(value, withTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  if (withTime) Object.assign(options, { hour: '2-digit', minute: '2-digit' });
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

export function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

function lengthError(value, label, min, max) {
  const v = (value || '').trim();
  if (!v) return `${label} wajib diisi`;
  if (v.length < min) return `${label} minimal ${min} karakter`;
  if (v.length > max) return `${label} maksimal ${max} karakter`;
  return null;
}

function compact(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
}

export function passwordError(password) {
  if (!password) return 'Password wajib diisi';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (password.length > 72) return 'Password maksimal 72 karakter';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password harus mengandung huruf dan angka';
  return null;
}

/* Aturan validasi di bawah ini sama dengan validator back-end. */

export function validateLogin({ email, password }) {
  const e = (email || '').trim();
  return compact({
    email: !e ? 'Email wajib diisi' : !EMAIL_PATTERN.test(e) ? 'Format email tidak valid' : null,
    password: !password ? 'Password wajib diisi' : null,
  });
}

export function validateRegister({ name, email, room, password, confirmPassword }) {
  const e = (email || '').trim();
  return compact({
    name: lengthError(name, 'Nama', 3, 100),
    email: !e ? 'Email wajib diisi' : !EMAIL_PATTERN.test(e) ? 'Format email tidak valid' : null,
    room: (room || '').trim().length > 50 ? 'Kamar maksimal 50 karakter' : null,
    password: passwordError(password),
    confirmPassword: password !== confirmPassword ? 'Konfirmasi password tidak sama' : null,
  });
}

export function validateProfile({ name, room }) {
  return compact({
    name: lengthError(name, 'Nama', 3, 100),
    room: (room || '').trim().length > 50 ? 'Kamar maksimal 50 karakter' : null,
  });
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  let newError = passwordError(newPassword);
  if (!newError && currentPassword === newPassword) {
    newError = 'Password baru harus berbeda dari password lama';
  }
  return compact({
    currentPassword: !currentPassword ? 'Password lama wajib diisi' : null,
    newPassword: newError,
    confirmPassword: newPassword !== confirmPassword ? 'Konfirmasi password tidak sama' : null,
  });
}

export function validateReport({ title, category, location, description, priority }) {
  return compact({
    title: lengthError(title, 'Judul', 5, 100),
    category: CATEGORIES.some((c) => c.value === category) ? null : 'Pilih kategori kerusakan',
    location: lengthError(location, 'Lokasi', 3, 100),
    description: lengthError(description, 'Deskripsi', 10, 1000),
    priority: PRIORITIES.some((p) => p.value === priority) ? null : 'Pilih tingkat prioritas',
  });
}

export function validateStatusChange({ status, note }) {
  const n = (note || '').trim();
  return compact({
    status: !status ? 'Pilih status baru' : null,
    note:
      status === 'ditolak' && !n
        ? 'Alasan penolakan wajib diisi'
        : n.length > 500
          ? 'Catatan maksimal 500 karakter'
          : null,
  });
}

export function validateNote({ note }) {
  return compact({ note: lengthError(note, 'Catatan', 3, 500) });
}
