import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';
import { describe, expect, it, vi } from 'vitest';
import ReportForm from './ReportForm';
import { fillReportForm, renderWithProviders } from '../../../test-utils';

describe('ReportForm', () => {
  it('menampilkan semua error validasi dan tidak submit', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(
      <ReportForm submitLabel="Kirim" onSubmit={onSubmit} onSuccess={() => {}} onCancel={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(screen.getByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Pilih kategori kerusakan')).toBeInTheDocument();
    expect(screen.getByText('Pilih tingkat prioritas')).toBeInTheDocument();
    expect(screen.getByText('Lokasi wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mengirim nilai yang sudah di-trim dan memanggil batal', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: { id: 3 } });
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    const { user } = renderWithProviders(
      <ReportForm submitLabel="Kirim" onSubmit={onSubmit} onSuccess={onSuccess} onCancel={onCancel} />,
    );
    await fillReportForm(user, { title: '  Kloset tersumbat  ' });
    expect(screen.getByText('32/1000 karakter')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Kloset tersumbat',
      category: 'air_sanitasi',
      priority: 'tinggi',
      location: 'Gedung A Lantai 1',
      description: 'Kloset tersumbat dan air meluap.',
    });
    expect(onSuccess).toHaveBeenCalledWith({ id: 3 }, expect.objectContaining({ title: 'Kloset tersumbat' }));
    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('menampilkan error dari server di field terkait dan membuka tombol kirim lagi', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: false, error: { message: 'Data tidak valid', errors: { title: 'Judul ditolak server' } } });
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(
      <ReportForm submitLabel="Kirim" onSubmit={onSubmit} onSuccess={onSuccess} onCancel={() => {}} />,
    );
    await fillReportForm(user);
    await user.click(screen.getByRole('button', { name: 'Kirim' }));
    expect(await screen.findByText('Judul ditolak server')).toBeInTheDocument();
    expect(screen.getByLabelText('Judul laporan')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Kirim' })).toBeEnabled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Data tidak valid' }));
  });
});
