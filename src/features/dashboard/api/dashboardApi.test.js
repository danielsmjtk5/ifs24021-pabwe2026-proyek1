import { describe, expect, it, vi } from 'vitest';
import reportApi from '../../reports/api/reportApi';
import dashboardApi from './dashboardApi';

vi.mock('../../reports/api/reportApi', () => ({ default: { getStats: vi.fn() } }));

describe('dashboardApi', () => {
  it('mengambil statistik lewat reportApi', async () => {
    reportApi.getStats.mockResolvedValueOnce({ total: 4 });
    expect(await dashboardApi.getStats()).toEqual({ total: 4 });
    expect(reportApi.getStats).toHaveBeenCalledTimes(1);
  });
});
