import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState, ErrorState, LoadingState } from './States';

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
