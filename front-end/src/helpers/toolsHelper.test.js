import { describe, expect, it } from 'vitest';
import {
  categoryLabel,
  formatDate,
  initials,
  passwordError,
  priorityLabel,
  statusLabel,
  validateLogin,
  validateNote,
  validatePasswordChange,
  validateProfile,
  validateRegister,
  validateReport,
  validateStatusChange,
} from './toolsHelper';

describe('label', () => {
  it('mengubah kode menjadi label bahasa Indonesia', () => {
    expect(categoryLabel('air_sanitasi')).toBe('Air & Sanitasi');
    expect(priorityLabel('darurat')).toBe('Darurat');
    expect(statusLabel('diproses')).toBe('Diproses');
    expect(statusLabel('tidak-dikenal')).toBe('tidak-dikenal');
    expect(statusLabel(undefined)).toBe('-');
  });
});

describe('formatDate', () => {
  it('memformat tanggal dengan locale Indonesia', () => {
    expect(formatDate('2026-10-20T08:00:00.000Z')).toMatch(/20 Okt 2026/);
    expect(formatDate('2026-10-20T08:00:00.000Z', true)).toMatch(/20 Okt 2026.*\d{2}[.:]\d{2}/);
  });
  it('mengembalikan "-" untuk nilai kosong atau tidak valid', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('bukan tanggal')).toBe('-');
  });
});

describe('initials', () => {
  it('mengambil dua huruf awal', () => {
    expect(initials('budi santoso wijaya')).toBe('BS');
    expect(initials('Admin')).toBe('A');
    expect(initials('')).toBe('?');
    expect(initials()).toBe('?');
  });
});

describe('validasi formulir', () => {
  it('login', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email wajib diisi',
      password: 'Password wajib diisi',
    });
    expect(validateLogin({ email: 'salah', password: 'x' })).toEqual({ email: 'Format email tidak valid' });
    expect(validateLogin({ email: ' a@b.co ', password: 'x' })).toEqual({});
    expect(validateLogin({})).toHaveProperty('email');
  });

  it('password', () => {
    expect(passwordError('')).toBe('Password wajib diisi');
    expect(passwordError('a1')).toBe('Password minimal 8 karakter');
    expect(passwordError(`a1${'x'.repeat(71)}`)).toBe('Password maksimal 72 karakter');
    expect(passwordError('12345678')).toBe('Password harus mengandung huruf dan angka');
    expect(passwordError('rahasia123')).toBeNull();
  });

  it('registrasi', () => {
    expect(validateRegister({ name: 'Bu', email: 'x', room: 'k'.repeat(51), password: 'a', confirmPassword: 'b' })).toEqual({
      name: 'Nama minimal 3 karakter',
      email: 'Format email tidak valid',
      room: 'Kamar maksimal 50 karakter',
      password: 'Password minimal 8 karakter',
      confirmPassword: 'Konfirmasi password tidak sama',
    });
    expect(validateRegister({ name: 'n'.repeat(101), email: '', password: 'rahasia123', confirmPassword: 'rahasia123' })).toEqual({
      name: 'Nama maksimal 100 karakter',
      email: 'Email wajib diisi',
    });
    expect(validateRegister({ name: 'Budi', email: 'b@x.id', password: 'rahasia123', confirmPassword: 'rahasia123' })).toEqual({});
  });

  it('profil', () => {
    expect(validateProfile({ name: '', room: 'r'.repeat(51) })).toEqual({
      name: 'Nama wajib diisi',
      room: 'Kamar maksimal 50 karakter',
    });
    expect(validateProfile({ name: 'Budi' })).toEqual({});
  });

  it('ganti password', () => {
    expect(validatePasswordChange({ currentPassword: '', newPassword: 'a', confirmPassword: 'b' })).toEqual({
      currentPassword: 'Password lama wajib diisi',
      newPassword: 'Password minimal 8 karakter',
      confirmPassword: 'Konfirmasi password tidak sama',
    });
    expect(
      validatePasswordChange({ currentPassword: 'rahasia123', newPassword: 'rahasia123', confirmPassword: 'rahasia123' }),
    ).toEqual({ newPassword: 'Password baru harus berbeda dari password lama' });
    expect(
      validatePasswordChange({ currentPassword: 'lama12345', newPassword: 'baru12345', confirmPassword: 'baru12345' }),
    ).toEqual({});
  });

  it('laporan', () => {
    expect(validateReport({ title: '', category: '', location: 'ab', description: 'pendek', priority: 'x' })).toEqual({
      title: 'Judul wajib diisi',
      category: 'Pilih kategori kerusakan',
      location: 'Lokasi minimal 3 karakter',
      description: 'Deskripsi minimal 10 karakter',
      priority: 'Pilih tingkat prioritas',
    });
    expect(
      validateReport({
        title: 'Lampu mati',
        category: 'listrik',
        location: 'Gedung A',
        description: 'Lampu koridor mati total.',
        priority: 'sedang',
      }),
    ).toEqual({});
  });

  it('perubahan status dan catatan', () => {
    expect(validateStatusChange({ status: '', note: '' })).toEqual({ status: 'Pilih status baru' });
    expect(validateStatusChange({ status: 'ditolak', note: ' ' })).toEqual({ note: 'Alasan penolakan wajib diisi' });
    expect(validateStatusChange({ status: 'selesai', note: 'x'.repeat(501) })).toEqual({
      note: 'Catatan maksimal 500 karakter',
    });
    expect(validateStatusChange({ status: 'diproses' })).toEqual({});
    expect(validateNote({ note: '' })).toEqual({ note: 'Catatan wajib diisi' });
    expect(validateNote({ note: 'Sudah dicek' })).toEqual({});
  });
});
