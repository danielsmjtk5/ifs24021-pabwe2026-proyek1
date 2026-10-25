import { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Pembungkus label + input + pesan error yang konsisten untuk semua formulir.
 * Bila `id` tidak diberikan, id unik dibuat dengan `useId` sehingga form yang sama
 * aman dipakai lebih dari sekali di satu halaman.
 */
function FormField({ id, label, error, hint, as = 'input', children, ...props }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const message = error || hint;
  const Component = as;
  const fieldProps = {
    id: fieldId,
    className: `input ${error ? 'input-error' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': message ? messageId : undefined,
    ...props,
  };
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      {as === 'select' ? <select {...fieldProps}>{children}</select> : <Component {...fieldProps} />}
      {error ? (
        <p id={messageId} className="field-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  as: PropTypes.oneOf(['input', 'textarea', 'select']),
  children: PropTypes.node,
};

export default FormField;
