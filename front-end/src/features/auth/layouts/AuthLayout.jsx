import { Outlet } from 'react-router-dom';
import { IconCircleCheck } from '@tabler/icons-react';
import Brand from '../../../components/Brand';

const points = [
  'Laporkan kerusakan fasilitas kapan saja',
  'Pantau status penanganan secara transparan',
  'Riwayat perbaikan tercatat rapi',
];

function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside aria-label="Informasi Layanan AsramaCare" className="relative hidden overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Brand light />
        <div>
          <p className="max-w-md text-4xl font-extrabold leading-tight">
            Asrama nyaman dimulai dari laporan yang tertangani.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-blue-100">
                <IconCircleCheck className="h-5 w-5 text-blue-300" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-blue-200/80">Proyek 1 PABWE · Institut Teknologi Del</p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </aside>
      <main id="main-content" className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
