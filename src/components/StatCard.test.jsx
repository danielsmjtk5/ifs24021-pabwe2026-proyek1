import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconClipboardList } from '@tabler/icons-react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('menampilkan nilai dan keterangan statistik', () => {
    render(<StatCard label="Total" value={12} icon={IconClipboardList} caption="2 ditolak" />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('2 ditolak')).toBeInTheDocument();
  });
});
