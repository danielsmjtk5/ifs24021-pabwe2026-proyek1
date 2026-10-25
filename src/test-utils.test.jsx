import { describe, expect, it } from 'vitest';
import { mockApi } from './test-utils';

describe('mockApi (server tiruan untuk test)', () => {
  it('mengembalikan 404 untuk endpoint yang tidak di-mock', async () => {
    mockApi();
    const response = await fetch('/api/tidak-ada');
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ success: false, message: 'Tidak di-mock: GET /api/tidak-ada' });
  });

  it('meneruskan body ke handler fungsi dan melempar Error dari handler', async () => {
    mockApi({
      'POST /api/echo': ({ body }) => ({ status: 201, data: body }),
      'GET /api/putus': () => new TypeError('Failed to fetch'),
      'GET /api/kosong': () => ({}),
    });
    const created = await fetch('/api/echo', { method: 'POST', body: JSON.stringify({ a: 1 }) });
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({ success: true, message: 'OK', data: { a: 1 } });
    await expect(fetch('/api/putus')).rejects.toThrow('Failed to fetch');
    const empty = await fetch('/api/kosong', { method: 'GET' });
    expect(await empty.json()).toEqual({ success: true, message: 'OK', data: null });
  });
});
