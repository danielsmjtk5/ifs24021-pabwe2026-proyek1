import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import { describe, expect, it, vi } from 'vitest';
import { IconClipboardList } from '@tabler/icons-react';
import { PriorityBadge, StatusBadge } from './Badges';
import { EmptyState, ErrorState, LoadingState } from './States';
import FormField from './FormField';
import StatCard from './StatCard';
import Pagination from './Pagination';
import Modal from './Modal';
import Brand from './Brand';
import PageHeader from './PageHeader';
import NotFoundPage from './NotFoundPage';
import Navbar from './Navbar';
import Sidebar, { navItemsFor } from './Sidebar';
import { alertError, confirmDanger, toastSuccess } from './alerts';
import { ADMIN, RESIDENT } from '../test-utils';

describe('Badges', () => {
  it('menampilkan label status dan prioritas', () => {
    render(
      <>
        <StatusBadge status="diproses" />
        <PriorityBadge priority="darurat" />
        <StatusBadge status="aneh" />
        <PriorityBadge priority="aneh" />
      </>,
    );
    expect(screen.getByText('Diproses')).toHaveClass('bg-blue-50');
    expect(screen.getByText('Darurat')).toHaveClass('bg-red-600');
    expect(screen.getAllByText('aneh')).toHaveLength(2);
  });
});

describe('States', () => {
  it('loading, empty, dan error', async () => {
    const onRetry = vi.fn();
    render(
      <>
        <LoadingState />
        <EmptyState title="Kosong" description="Belum ada data" action={<button type="button">Aksi</button>} />
        <ErrorState message="Server mati" onRetry={onRetry} />
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Memuat data...');
    expect(screen.getByText('Belum ada data')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Server mati');
    await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('ErrorState tanpa tombol retry dan EmptyState tanpa deskripsi', () => {
    render(
      <>
        <ErrorState message="x" />
        <EmptyState title="Kosong" />
      </>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('FormField', () => {
  it('menghubungkan label, input, dan error', () => {
    render(<FormField id="judul" label="Judul" error="Judul wajib diisi" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Judul');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('input-error');
    expect(screen.getByText('Judul wajib diisi')).toBeInTheDocument();
  });

  it('mendukung select, textarea, dan hint', () => {
    render(
      <>
        <FormField id="kat" as="select" label="Kategori" value="a" onChange={() => {}}>
          <option value="a">A</option>
        </FormField>
        <FormField id="desk" as="textarea" label="Deskripsi" hint="Maks 1000" value="" onChange={() => {}} />
      </>,
    );
    expect(screen.getByLabelText('Kategori').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Deskripsi').tagName).toBe('TEXTAREA');
    expect(screen.getByText('Maks 1000')).toBeInTheDocument();
  });
});

describe('StatCard dan PageHeader', () => {
  it('menampilkan nilai statistik', () => {
    render(
      <>
        <StatCard label="Total" value={12} icon={IconClipboardList} caption="2 ditolak" />
        <PageHeader title="Judul" description="Deskripsi" actions={<button type="button">Aksi</button>} />
        <PageHeader title="Tanpa aksi" />
      </>,
    );
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('2 ditolak')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Judul' })).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('tidak tampil jika hanya satu halaman', () => {
    const { container } = render(<Pagination pagination={{ page: 1, totalPages: 1, total: 3 }} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    const { container: none } = render(<Pagination pagination={null} onChange={() => {}} />);
    expect(none).toBeEmptyDOMElement();
  });

  it('navigasi halaman dan menonaktifkan tombol di ujung', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Pagination pagination={{ page: 1, totalPages: 3, total: 25 }} onChange={onChange} />);
    expect(screen.getByRole('button', { name: /Sebelumnya/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Berikutnya/ }));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender(<Pagination pagination={{ page: 3, totalPages: 3, total: 25 }} onChange={onChange} />);
    expect(screen.getByRole('button', { name: /Berikutnya/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Sebelumnya/ }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

describe('Modal', () => {
  it('menutup lewat tombol dan tombol Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal title="Judul modal" description="Penjelasan" onClose={onClose}>
        <p>Isi</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Judul modal' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('Brand dan NotFoundPage', () => {
  it('render', () => {
    render(
      <MemoryRouter>
        <Brand />
        <Brand light />
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('AsramaCare')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke dashboard' })).toHaveAttribute('href', '/');
  });
});

describe('Navbar', () => {
  it('menampilkan pengguna dan memanggil handler', async () => {
    const onMenu = vi.fn();
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <Navbar user={RESIDENT} onMenu={onMenu} onLogout={onLogout} />
      </MemoryRouter>,
    );
    expect(screen.getByText('BS')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Buka menu' }));
    await userEvent.click(screen.getByRole('button', { name: /Keluar/ }));
    expect(onMenu).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });
});

describe('Sidebar', () => {
  it('menu berbeda untuk penghuni dan admin', () => {
    expect(navItemsFor('penghuni').map((i) => i.label)).toEqual([
      'Dashboard',
      'Semua Laporan',
      'Laporan Saya',
      'Buat Laporan',
      'Profil',
    ]);
    expect(navItemsFor('admin').map((i) => i.label)).toEqual(['Dashboard', 'Semua Laporan', 'Kelola Laporan', 'Profil']);
  });

  it('menandai menu aktif dan menutup di mobile', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter initialEntries={['/my-reports']}>
        <Sidebar user={RESIDENT} open onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Laporan Saya' })).toHaveClass('bg-white/10');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass('bg-white/10');
    await userEvent.click(screen.getByTestId('sidebar-backdrop'));
    await userEvent.click(screen.getByRole('button', { name: 'Tutup menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'Profil' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('tersembunyi saat tertutup', () => {
    render(
      <MemoryRouter>
        <Sidebar user={ADMIN} open={false} onClose={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Navigasi utama')).toHaveClass('-translate-x-full');
  });
});

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
