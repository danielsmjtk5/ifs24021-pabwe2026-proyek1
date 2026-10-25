import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconClipboardList } from '@tabler/icons-react';
import StatCard from './StatCard';
import PageHeader from './PageHeader';

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
