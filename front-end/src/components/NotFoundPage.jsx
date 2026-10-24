import { Link } from 'react-router-dom';
import { IconMapOff } from '@tabler/icons-react';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-2xl bg-blue-50 p-5 text-blue-700">
        <IconMapOff className="h-10 w-10" aria-hidden="true" />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-blue-700">404</p>
      <h1 className="text-2xl font-extrabold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-slate-500">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
      <Link to="/" className="btn-primary">
        Kembali ke dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
