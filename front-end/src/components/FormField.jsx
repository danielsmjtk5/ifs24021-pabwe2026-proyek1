import PropTypes from 'prop-types';

/** Pembungkus label + input + pesan error yang konsisten untuk semua formulir. */
function FormField({ id, label, error, hint, as = 'input', children, ...props }) {
  const Component = as;
  const className = `input ${error ? 'input-error' : ''}`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {as === 'select' ? (
        <select id={id} className={className} aria-invalid={Boolean(error)} {...props}>
          {children}
        </select>
      ) : (
        <Component id={id} className={className} aria-invalid={Boolean(error)} {...props} />
      )}
      {error ? (
        <p className="field-error">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  as: PropTypes.oneOf(['input', 'textarea', 'select']),
  children: PropTypes.node,
};

export default FormField;
