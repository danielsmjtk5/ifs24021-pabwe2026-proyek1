import { afterEach, describe, expect, it, vi } from 'vitest';
import api, { ApiError, apiRequest, buildUrl, setUnauthorizedHandler } from './apiHelper';
import { mockApi } from '../test-utils';

afterEach(() => setUnauthorizedHandler(null));

describe('buildUrl', () => {
  it('menambahkan base URL dan query, mengabaikan nilai kosong', () => {
    expect(buildUrl('/reports')).toBe('/api/reports');
    expect(buildUrl('/reports', { q: 'lampu', status: '', mine: false, page: 2, x: null, y: undefined })).toBe(
      '/api/reports?q=lampu&page=2',
    );
    expect(buildUrl('/reports', { mine: true })).toBe('/api/reports?mine=true');
    expect(buildUrl('/reports', { status: '' })).toBe('/api/reports');
  });
});

describe('apiRequest', () => {
  it('mengirim JSON dengan cookie dan mengembalikan data', async () => {
    const fetchMock = mockApi({ 'POST /api/reports': { status: 201, data: { report: { id: 1 } } } });
    const data = await api.post('/reports', { title: 'A' });
    expect(data).toEqual({ report: { id: 1 } });
    const [, options] = fetchMock.mock.calls[0];
    expect(options).toMatchObject({
      method: 'POST',
      credentials: 'include',
      body: '{"title":"A"}',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  });

  it('GET tidak mengirim body', async () => {
    const fetchMock = mockApi({ 'GET /api/health': { data: { status: 'ok' } } });
    await api.get('/health');
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
  });

  it('semua method helper memakai method HTTP yang benar', async () => {
    const fetchMock = mockApi({
      'PUT /api/x': { data: 1 },
      'PATCH /api/x': { data: 2 },
      'DELETE /api/x': { data: 3 },
    });
    expect(await api.put('/x', {})).toBe(1);
    expect(await api.patch('/x', {})).toBe(2);
    expect(await api.delete('/x')).toBe(3);
    expect(fetchMock.mock.calls.map((c) => c[1].method)).toEqual(['PUT', 'PATCH', 'DELETE']);
  });

  it('melempar ApiError berisi pesan dan error field dari server', async () => {
    mockApi({
      'POST /api/reports': {
        status: 400,
        body: { success: false, message: 'Data tidak valid', errors: { title: 'Judul wajib diisi' } },
      },
    });
    const error = await api.post('/reports', {}).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: 'Data tidak valid', status: 400, errors: { title: 'Judul wajib diisi' } });
  });

  it('memberi pesan ramah saat server tidak dapat dihubungi', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await apiRequest('/health').catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/Tidak dapat terhubung ke server/);
  });

  it('menangani respons yang bukan JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });
    const error = await apiRequest('/health').catch((e) => e);
    expect(error).toMatchObject({ message: 'Permintaan gagal (kode 500)', status: 500, errors: null });
  });

  it('502 dari proxy (back-end mati) diberi pesan server tidak dapat dihubungi', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
    });
    const error = await apiRequest('/auth/me').catch((e) => e);
    expect(error.status).toBe(502);
    expect(error.message).toMatch(/Tidak dapat terhubung ke server/);
  });

  it('respons 200 dengan success=false tetap dianggap gagal', async () => {
    mockApi({ 'GET /api/x': { status: 200, body: { success: false, message: 'Ditolak' } } });
    await expect(api.get('/x')).rejects.toThrow('Ditolak');
  });

  it('memanggil handler 401 kecuali skipAuthHandler', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockApi({ 'GET /api/reports': { status: 401, message: 'Sesi berakhir' } });
    await expect(api.get('/reports')).rejects.toThrow('Sesi berakhir');
    expect(handler).toHaveBeenCalledTimes(1);
    await expect(api.get('/reports', { skipAuthHandler: true })).rejects.toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('401 tanpa handler terdaftar tetap melempar error', async () => {
    mockApi({ 'GET /api/reports': { status: 401, message: 'Sesi berakhir' } });
    await expect(api.get('/reports')).rejects.toMatchObject({ status: 401 });
  });

  it('ApiError memiliki nilai default', () => {
    const error = new ApiError('x');
    expect(error).toMatchObject({ name: 'ApiError', status: 0, errors: null });
  });
});
