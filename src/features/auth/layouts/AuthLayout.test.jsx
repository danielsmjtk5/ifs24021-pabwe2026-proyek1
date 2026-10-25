import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AuthLayout from './AuthLayout';
import { renderWithProviders } from '../../../test-utils';

describe('AuthLayout', () => {
  it('menampilkan panel merek dan outlet', () => {
    renderWithProviders(<AuthLayout />, {
      path: '/auth',
      route: '/auth/login',
      extraRoutes: (
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<p>Isi form</p>} />
        </Route>
      ),
    });
    expect(screen.getByText(/Asrama nyaman dimulai/)).toBeInTheDocument();
  });
});
