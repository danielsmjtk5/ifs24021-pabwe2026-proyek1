import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusTimeline from './StatusTimeline';
import { renderWithProviders } from '../../../test-utils';

describe('StatusTimeline', () => {
  it('item tanpa catatan', () => {
    renderWithProviders(
      <StatusTimeline history={[{ id: 1, old_status: 'menunggu', new_status: 'selesai', note: null, created_at: '2026-10-20T08:00:00Z', changed_by_name: 'Budi', changed_by_role: 'penghuni' }]} />,
    );
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByText('oleh Budi')).toBeInTheDocument();
  });
});
