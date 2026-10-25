import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

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
