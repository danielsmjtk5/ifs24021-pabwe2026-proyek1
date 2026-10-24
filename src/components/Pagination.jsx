import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import PropTypes from 'prop-types';

function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Halaman <span className="font-semibold text-slate-700">{page}</span> dari {totalPages} · {total} laporan
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary px-3" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <IconChevronLeft className="h-4 w-4" aria-hidden="true" />
          Sebelumnya
        </button>
        <button
          type="button"
          className="btn-secondary px-3"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
          <IconChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Pagination;
