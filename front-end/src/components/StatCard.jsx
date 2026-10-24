import PropTypes from 'prop-types';

const TONES = {
  navy: 'bg-blue-950 text-white',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
};

function StatCard({ label, value, icon: Icon, tone = 'blue', caption }) {
  return (
    <div className="card flex items-start justify-between gap-3 p-4 sm:p-5">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        {caption && <p className="mt-1 text-xs text-slate-600">{caption}</p>}
      </div>
      <div className={`hidden rounded-xl p-3 min-[420px]:block ${TONES[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  tone: PropTypes.oneOf(Object.keys(TONES)),
  caption: PropTypes.string,
};

export default StatCard;
