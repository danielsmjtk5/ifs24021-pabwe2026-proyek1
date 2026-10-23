import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { setupStore } from './app/store';

export const RESIDENT = {
  id: 2,
  name: 'Budi Santoso',
  email: 'budi@asramacare.test',
  room: 'A-101',
  role: 'penghuni',
  created_at: '2026-10-01T08:00:00.000Z',
  updated_at: '2026-10-01T08:00:00.000Z',
};

export const ADMIN = { ...RESIDENT, id: 1, name: 'Admin Asrama', email: 'admin@asramacare.test', room: null, role: 'admin' };

export function authState(user = RESIDENT, extra = {}) {
  return { auth: { user, sessionStatus: 'ready', sessionError: null, sessionExpired: false, ...extra } };
}

export function makeReport(overrides = {}) {
  return {
    id: 7,
    title: 'Lampu kamar mandi mati',
    category: 'listrik',
    location: 'Gedung A Lantai 2',
    description: 'Lampu kamar mandi mati sejak kemarin malam.',
    priority: 'tinggi',
    status: 'menunggu',
    reporter: { id: RESIDENT.id, name: RESIDENT.name, email: RESIDENT.email, room: RESIDENT.room },
    created_at: '2026-10-20T08:00:00.000Z',
    updated_at: '2026-10-20T08:00:00.000Z',
    permissions: { canEdit: true, canDelete: true, canChangeStatus: false, canAddNote: false, nextStatuses: [] },
    history: [
      {
        id: 1,
        old_status: null,
        new_status: 'menunggu',
        note: 'Laporan dibuat',
        created_at: '2026-10-20T08:00:00.000Z',
        changed_by: RESIDENT.id,
        changed_by_name: RESIDENT.name,
        changed_by_role: 'penghuni',
      },
    ],
    ...overrides,
  };
}

/** Menampilkan path aktif agar navigasi dapat diperiksa dalam test. */
export function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

export function renderWithProviders(
  ui,
  { preloadedState, store = setupStore(preloadedState), route = '/', path = '/', extraRoutes = null } = {},
) {
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          {extraRoutes}
          <Route path="*" element={null} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </Provider>,
  );
  return { store, user: userEvent.setup(), ...result };
}

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

/**
 * Mengganti fetch dengan server tiruan. Kunci handler berbentuk "METHOD /path".
 * Handler dapat berupa objek { status, data, body } atau fungsi yang mengembalikannya.
 */
export function mockApi(handlers = {}) {
  const fetchMock = vi.fn(async (input, options = {}) => {
    const url = new URL(input, 'http://localhost');
    const key = `${options.method || 'GET'} ${url.pathname}`;
    const handler = handlers[key];
    if (!handler) return jsonResponse(404, { success: false, message: `Tidak di-mock: ${key}` });
    const result =
      typeof handler === 'function'
        ? await handler({ url, body: options.body ? JSON.parse(options.body) : undefined })
        : handler;
    if (result instanceof Error) throw result;
    const status = result.status ?? 200;
    const body = result.body ?? { success: status < 400, message: result.message || 'OK', data: result.data ?? null };
    return jsonResponse(status, body);
  });
  globalThis.fetch = fetchMock;
  return fetchMock;
}
