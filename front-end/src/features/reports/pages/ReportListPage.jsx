import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IconFilePlus } from '@tabler/icons-react';
import PageHeader from '../../../components/PageHeader';
import Pagination from '../../../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../../../components/States';
import ReportFilters, { DEFAULT_FILTERS } from '../components/ReportFilters';
import ReportList from '../components/ReportList';
import { fetchReports } from '../states/reportsSlice';

const MODES = {
  all: {
    title: 'Semua Laporan',
    description: 'Laporan kerusakan fasilitas dari seluruh penghuni asrama.',
  },
  mine: {
    title: 'Laporan Saya',
    description: 'Pantau status laporan yang Anda buat.',
  },
  admin: {
    title: 'Kelola Laporan',
    description: 'Tinjau, prioritaskan, dan perbarui status penanganan laporan.',
  },
};

const PAGE_SIZE = 10;

function ReportListPage({ mode = 'all' }) {
  const config = MODES[mode];
  const user = useSelector((state) => state.auth.user);
  const { items, pagination, status, error } = useSelector((state) => state.reports.list);
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(
    mode === 'admin' ? { ...DEFAULT_FILTERS, sort: 'priority' } : DEFAULT_FILTERS,
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchReports({ ...filters, page, limit: PAGE_SIZE, mine: mode === 'mine' }));
  }, [dispatch, filters, page, mode]);

  const onFiltersChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const retry = () => dispatch(fetchReports({ ...filters, page, limit: PAGE_SIZE, mine: mode === 'mine' }));
  const canCreate = user.role !== 'admin';

  let content;
  if (status === 'failed') {
    content = <ErrorState message={error} onRetry={retry} />;
  } else if (status !== 'succeeded') {
    content = <LoadingState message="Memuat laporan..." />;
  } else if (items.length === 0) {
    content = (
      <EmptyState
        title="Tidak ada laporan"
        description="Belum ada laporan yang sesuai dengan filter ini."
        action={
          canCreate && (
            <Link to="/reports/new" className="btn-primary">
              Buat laporan
            </Link>
          )
        }
      />
    );
  } else {
    content = (
      <>
        <ReportList reports={items} showReporter={mode !== 'mine'} />
        <Pagination pagination={pagination} onChange={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          canCreate && (
            <Link to="/reports/new" className="btn-primary">
              <IconFilePlus className="h-5 w-5" aria-hidden="true" />
              Buat laporan
            </Link>
          )
        }
      />
      <div className="card overflow-hidden">
        <ReportFilters filters={filters} onChange={onFiltersChange} />
        {content}
      </div>
    </>
  );
}

export default ReportListPage;
