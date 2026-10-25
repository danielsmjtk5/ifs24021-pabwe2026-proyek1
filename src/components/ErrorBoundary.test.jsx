import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function Broken() {
  throw new Error('Gagal render');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React mencetak error yang tertangkap ke console; dibungkam agar output test bersih.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('menampilkan isi normal bila tidak ada error', () => {
    render(
      <ErrorBoundary resetKey="/">
        <p>Aman</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Aman')).toBeInTheDocument();
  });

  it('menampilkan pesan dan tombol muat ulang saat terjadi error', async () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...globalThis.location, reload });
    render(
      <ErrorBoundary resetKey="/">
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Terjadi kesalahan pada aplikasi' })).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith('Kesalahan tidak tertangani:', expect.any(Error), expect.anything());
    await userEvent.click(screen.getByRole('button', { name: 'Muat ulang' }));
    expect(reload).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('membersihkan error saat resetKey berganti (pindah halaman)', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(
      <ErrorBoundary resetKey="/b">
        <p>Halaman baru</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Halaman baru')).toBeInTheDocument();
  });

  it('tetap menampilkan isi saat resetKey tidak berubah', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <p>Satu</p>
      </ErrorBoundary>,
    );
    rerender(
      <ErrorBoundary resetKey="/a">
        <p>Dua</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Dua')).toBeInTheDocument();
  });
});
