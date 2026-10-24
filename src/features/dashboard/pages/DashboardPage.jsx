import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  IconCircleCheck,
  IconClipboardList,
  IconClockHour4,
  IconFilePlus,
  IconTool,
} from '@tabler/icons-react';
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../../../components/States';
import { STATUSES, categoryLabel } from '../../../helpers/toolsHelper';
import ReportList from '../../reports/components/ReportList';
import { fetchStats } from '../states/dashboardSlice';
import PropTypes from 'prop-types';

const BAR_COLORS = {
  menunggu: 'bg-amber-400',
  diproses: 'bg-blue-600',
  selesai: 'bg-emerald-500',
  ditolak: 'bg-rose-500',
};

function StatusSummary({ byStatus, total }) {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-slate-900">Ringkasan status</h2>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        {STATUSES.map(({ value }) =>
          byStatus[value] > 0 ? (
            <div key={value} className={BAR_COLORS[value]} style={{ width: `${(byStatus[value] / total) * 100}%` }} />
          ) : null,
        )}
      </div>
      <ul className="mt-4 space-y-2.5">
        {STATUSES.map(({ value, label }) => (
          <li key={value} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${BAR_COLORS[value]}`} aria-hidden="true" />
              {label}
            </span>
            <span className="font-semibold text-slate-900">
              {byStatus[value]}
              <span className="ml-1 font-normal text-slate-500">
                ({total ? Math.round((byStatus[value] / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategorySummary({ byCategory }) {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-slate-900">Kategori terbanyak</h2>
      {byCategory.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Belum ada data kategori.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {byCategory.map((c) => (
            <li key={c.category} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{categoryLabel(c.category)}</span>
              <span className="font-semibold text-slate-900">{c.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const { stats, status, error } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const header = (
    <PageHeader
      title="Dashboard"
      description={isAdmin ? 'Ringkasan seluruh laporan kerusakan asrama.' : 'Ringkasan laporan kerusakan yang Anda buat.'}
      actions={
        !isAdmin && (
          <Link to="/reports/new" className="btn-primary">
            <IconFilePlus className="h-5 w-5" aria-hidden="true" />
            Buat laporan
          </Link>
        )
      }
    />
  );

  if (status === 'failed') {
    return (
      <>
        {header}
        <div className="card">
          <ErrorState message={error} onRetry={() => dispatch(fetchStats())} />
        </div>
      </>
    );
  }
  if (!stats) {
    return (
      <>
        {header}
        <LoadingState message="Memuat statistik..." />
      </>
    );
  }

  const { byStatus, total, recent, byCategory } = stats;
  return (
    <>
      {header}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Statistik laporan">
        <StatCard label="Total laporan" value={total} icon={IconClipboardList} tone="navy" />
        <StatCard label="Menunggu" value={byStatus.menunggu} icon={IconClockHour4} tone="amber" />
        <StatCard label="Diproses" value={byStatus.diproses} icon={IconTool} tone="blue" />
        <StatCard
          label="Selesai"
          value={byStatus.selesai}
          icon={IconCircleCheck}
          tone="green"
          caption={byStatus.ditolak ? `${byStatus.ditolak} laporan ditolak` : undefined}
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">Laporan terbaru</h2>
            <Link to={isAdmin ? '/admin/reports' : '/my-reports'} className="text-sm font-semibold text-blue-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="Belum ada laporan"
              description={isAdmin ? 'Laporan dari penghuni akan muncul di sini.' : 'Laporkan kerusakan pertama Anda.'}
            />
          ) : (
            <ReportList reports={recent} showReporter={isAdmin} />
          )}
        </div>
        <div className="space-y-6">
          <StatusSummary byStatus={byStatus} total={total} />
          <CategorySummary byCategory={byCategory} />
        </div>
      </section>
    </>
  );
}

StatusSummary.propTypes = {
  byStatus: PropTypes.objectOf(PropTypes.number).isRequired,
  total: PropTypes.number.isRequired,
};
CategorySummary.propTypes = {
  byCategory: PropTypes.arrayOf(
    PropTypes.shape({ category: PropTypes.string.isRequired, count: PropTypes.number.isRequired }),
  ).isRequired,
};

export default DashboardPage;
