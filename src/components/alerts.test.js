import { waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { alertError, confirmDanger, toastSuccess } from './alerts';

describe('alerts', () => {
  it('confirmDanger mengembalikan pilihan pengguna', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await confirmDanger({ title: 'Hapus?', text: 'Yakin' })).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hapus?', confirmButtonText: 'Ya, hapus', icon: 'warning' }));
  });

  it('toastSuccess dan alertError', async () => {
    toastSuccess('Berhasil');
    alertError('Gagal total');
    // SweetAlert2 dimuat secara dinamis, jadi tunggu sampai kedua panggilan terjadi.
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(2));
    expect(Swal.fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ toast: true, title: 'Berhasil' }));
    expect(Swal.fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: 'error', text: 'Gagal total' }));
  });
});

describe('alerts saat SweetAlert2 gagal dimuat', () => {
  afterEach(() => {
    vi.doUnmock('sweetalert2');
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('dialog dianggap batal, error dicatat, dan import dicoba ulang', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.resetModules();
    let attempts = 0;
    vi.doMock('sweetalert2', () => {
      attempts += 1;
      throw new Error('Failed to fetch dynamically imported module');
    });
    const alerts = await import('./alerts');
    expect(await alerts.confirmDanger({ title: 'Hapus?', text: 'Yakin' })).toBe(false);
    await expect(alerts.alertError('Gagal')).resolves.toEqual({ isConfirmed: false, isDismissed: true });
    expect(console.error).toHaveBeenCalledWith('Dialog tidak dapat ditampilkan:', expect.any(Error));
    expect(attempts).toBe(2);
  });

  it('error dari Swal.fire juga ditangani', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    Swal.fire.mockRejectedValueOnce(new Error('rusak'));
    await expect(toastSuccess('Berhasil')).resolves.toEqual({ isConfirmed: false, isDismissed: true });
  });
});
