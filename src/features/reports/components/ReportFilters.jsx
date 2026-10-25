import { useId } from 'react';
import { IconFilterOff, IconSearch } from '@tabler/icons-react';
import useInput from '../../../hooks/useInput';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../../helpers/toolsHelper';
import PropTypes from 'prop-types';
import { optionShape } from '../../../helpers/propShapes';

export const DEFAULT_FILTERS = {
  q: '',
  category: '',
  priority: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  sort: 'newest',
};

function Select({ id, label, value, onChange, options, allLabel }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {allLabel && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReportFilters({ filters, onChange }) {
  const [q, onQChange, setQ] = useInput(filters.q);
  // Prefix id unik supaya label tetap terhubung ke input yang benar walau filter dirender lebih dari sekali.
  const uid = useId();
  const fieldId = (name) => `${uid}-${name}`;
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const onSearch = (event) => {
    event.preventDefault();
    onChange({ ...filters, q: q.trim() });
  };

  const onReset = () => {
    setQ('');
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-3 border-b border-slate-200 p-5">
      <form className="flex gap-2" onSubmit={onSearch} role="search">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor={fieldId('q')} className="sr-only">
            Cari laporan
          </label>
          <input
            id={fieldId('q')}
            className="input pl-9"
            placeholder="Cari berdasarkan judul atau lokasi..."
            value={q}
            onChange={onQChange}
          />
        </div>
        <button type="submit" className="btn-primary">
          Cari
        </button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select id={fieldId('category')} label="Kategori" value={filters.category} onChange={set('category')} options={CATEGORIES} allLabel="Semua kategori" />
        <Select id={fieldId('priority')} label="Prioritas" value={filters.priority} onChange={set('priority')} options={PRIORITIES} allLabel="Semua prioritas" />
        <Select id={fieldId('status')} label="Status" value={filters.status} onChange={set('status')} options={STATUSES} allLabel="Semua status" />
        <Select
          id={fieldId('sort')}
          label="Urutkan"
          value={filters.sort}
          onChange={set('sort')}
          options={[
            { value: 'newest', label: 'Terbaru' },
            { value: 'oldest', label: 'Terlama' },
            { value: 'priority', label: 'Prioritas tertinggi' },
          ]}
        />
        <div>
          <label htmlFor={fieldId('dateFrom')} className="sr-only">
            Dari tanggal
          </label>
          <input id={fieldId('dateFrom')} type="date" className="input" value={filters.dateFrom} onChange={(e) => set('dateFrom')(e.target.value)} />
        </div>
        <div>
          <label htmlFor={fieldId('dateTo')} className="sr-only">
            Sampai tanggal
          </label>
          <input id={fieldId('dateTo')} type="date" className="input" value={filters.dateTo} onChange={(e) => set('dateTo')(e.target.value)} />
        </div>
        <button type="button" className="btn-ghost sm:justify-self-start" onClick={onReset}>
          <IconFilterOff className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
}

Select.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(optionShape).isRequired,
  allLabel: PropTypes.string,
};
ReportFilters.propTypes = {
  filters: PropTypes.shape({
    q: PropTypes.string,
    category: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
    sort: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ReportFilters;
