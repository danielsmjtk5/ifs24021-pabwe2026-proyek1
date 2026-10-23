import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/** Route guard hanya untuk pengalaman pengguna; keamanan sebenarnya ada di back-end. */
export function RequireAuth() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RequireRole({ role }) {
  const user = useSelector((state) => state.auth.user);
  if (user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const user = useSelector((state) => state.auth.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
