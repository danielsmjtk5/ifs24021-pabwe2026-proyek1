import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriorityBadge, StatusBadge } from './Badges';

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
