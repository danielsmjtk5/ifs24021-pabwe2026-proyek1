import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage';
import { GuestOnly, RequireAuth, RequireRole } from './components/RouteGuards';
import { ErrorState, LoadingState } from './components/States';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './features/auth/layouts/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import { fetchCurrentUser, sessionExpired } from './features/auth/states/authSlice';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ReportCreatePage from './features/reports/pages/ReportCreatePage';
import ReportDetailPage from './features/reports/pages/ReportDetailPage';
import ReportEditPage from './features/reports/pages/ReportEditPage';
import ReportListPage from './features/reports/pages/ReportListPage';
import ProfilePage from './features/users/pages/ProfilePage';
import { setUnauthorizedHandler } from './helpers/apiHelper';

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
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="Menyiapkan AsramaCare..." />
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorState message={sessionError} onRetry={() => dispatch(fetchCurrentUser())} />
      </div>
    );
  }

  return (
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
  );
}

export default App;
