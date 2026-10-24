import { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage';
import { GuestOnly, RequireAuth, RequireRole } from './components/RouteGuards';
import { ErrorState, LoadingState } from './components/States';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './features/auth/layouts/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import { fetchCurrentUser, sessionExpired } from './features/auth/states/authSlice';
import { setUnauthorizedHandler } from './helpers/apiHelper';

// Halaman selain login dimuat terpisah (code splitting) agar JavaScript awal lebih kecil.
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ReportCreatePage = lazy(() => import('./features/reports/pages/ReportCreatePage'));
const ReportDetailPage = lazy(() => import('./features/reports/pages/ReportDetailPage'));
const ReportEditPage = lazy(() => import('./features/reports/pages/ReportEditPage'));
const ReportListPage = lazy(() => import('./features/reports/pages/ReportListPage'));
const ProfilePage = lazy(() => import('./features/users/pages/ProfilePage'));

function App() {
  const dispatch = useDispatch();
  const { sessionStatus, sessionError } = useSelector((state) => state.auth);

  useEffect(() => {
    // Respons 401 dari endpoint terlindungi berarti sesi sudah tidak berlaku.
    setUnauthorizedHandler(() => dispatch(sessionExpired()));
    dispatch(fetchCurrentUser());
    return () => setUnauthorizedHandler(null);
  }, [dispatch]);

  if (sessionStatus !== 'ready') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="sr-only">AsramaCare</h1>
        <LoadingState message="Menyiapkan AsramaCare..." />
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="sr-only">AsramaCare</h1>
        <ErrorState message={sessionError} onRetry={() => dispatch(fetchCurrentUser())} />
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <h1 className="sr-only">AsramaCare</h1>
          <LoadingState message="Memuat halaman..." />
        </main>
      }
    >
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportListPage key="all" mode="all" />} />
            <Route path="my-reports" element={<ReportListPage key="mine" mode="mine" />} />
            <Route path="reports/:id" element={<ReportDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route element={<RequireRole role="penghuni" />}>
              <Route path="reports/new" element={<ReportCreatePage />} />
              <Route path="reports/:id/edit" element={<ReportEditPage />} />
            </Route>
            <Route element={<RequireRole role="admin" />}>
              <Route path="admin/reports" element={<ReportListPage key="admin" mode="admin" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
