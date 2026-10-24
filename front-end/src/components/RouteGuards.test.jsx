import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GuestOnly, RequireAuth, RequireRole } from './RouteGuards';
import { ADMIN, RESIDENT, authState, renderWithProviders } from '../test-utils';

const Page = ({ text }) => <p>{text}</p>;

function renderGuard(guard, { user, route = '/rahasia' }) {
  return renderWithProviders(guard, {
    preloadedState: authState(user),
    route,
    path: '/__guard',
    extraRoutes: (
      <>
        <Route element={guard}>
          <Route path="/rahasia" element={<Page text="Halaman terlindungi" />} />
          <Route path="/auth/login" element={<Page text="Halaman login" />} />
        </Route>
        <Route path="/" element={<Page text="Beranda" />} />
      </>
    ),
  });
}

describe('RequireAuth', () => {
  it('mengalihkan tamu ke halaman login', () => {
    renderWithProviders(<RequireAuth />, {
      preloadedState: authState(null),
      route: '/rahasia',
      path: '/x',
      extraRoutes: (
        <>
          <Route element={<RequireAuth />}>
            <Route path="/rahasia" element={<Page text="Halaman terlindungi" />} />
          </Route>
          <Route path="/auth/login" element={<Page text="Halaman login" />} />
        </>
      ),
    });
    expect(screen.getByText('Halaman login')).toBeInTheDocument();
  });

  it('mengizinkan pengguna yang sudah login', () => {
    renderGuard(<RequireAuth />, { user: RESIDENT });
    expect(screen.getByText('Halaman terlindungi')).toBeInTheDocument();
  });
});

describe('RequireRole', () => {
  it('penghuni dialihkan dari halaman admin', () => {
    renderGuard(<RequireRole role="admin" />, { user: RESIDENT });
    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('admin dapat mengakses halaman admin', () => {
    renderGuard(<RequireRole role="admin" />, { user: ADMIN });
    expect(screen.getByText('Halaman terlindungi')).toBeInTheDocument();
  });
});

describe('GuestOnly', () => {
  it('pengguna login dialihkan dari halaman login', () => {
    renderGuard(<GuestOnly />, { user: RESIDENT, route: '/auth/login' });
    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('tamu dapat membuka halaman login', () => {
    renderGuard(<GuestOnly />, { user: null, route: '/auth/login' });
    expect(screen.getByText('Halaman login')).toBeInTheDocument();
  });
});
