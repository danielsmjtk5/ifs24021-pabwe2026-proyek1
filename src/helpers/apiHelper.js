const OFFLINE_MESSAGE = 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.';
const GATEWAY_STATUSES = new Set([502, 503, 504]);

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

let unauthorizedHandler = null;

/** Dipanggil saat API mengembalikan 401 (sesi kedaluwarsa) di luar proses login. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function buildUrl(path, query) {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Pemanggil API terpusat. Token sesi disimpan di cookie httpOnly oleh server,
 * sehingga cukup mengirim `credentials: 'include'` dan tidak ada token di localStorage.
 */
export async function apiRequest(path, { method = 'GET', body, query, skipAuthHandler = false } = {}) {
  const options = { method, credentials: 'include', headers: { Accept: 'application/json' } };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), options);
  } catch {
    throw new ApiError(OFFLINE_MESSAGE);
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok || !json || json.success === false) {
    if (response.status === 401 && !skipAuthHandler && unauthorizedHandler) {
      unauthorizedHandler();
    }
    // 502/503/504 tanpa body JSON berarti back-end mati di balik proxy (Vite atau hosting).
    const fallback = GATEWAY_STATUSES.has(response.status)
      ? OFFLINE_MESSAGE
      : `Permintaan gagal (kode ${response.status})`;
    const message = json?.message || fallback;
    throw new ApiError(message, response.status, json?.errors || null);
  }
  return json.data;
}

const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};

export default api;
