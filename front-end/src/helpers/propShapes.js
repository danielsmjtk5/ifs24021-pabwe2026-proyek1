import PropTypes from 'prop-types';

// Bentuk data yang dipakai bersama oleh beberapa komponen (validasi props).
export const userShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
  room: PropTypes.string,
  role: PropTypes.oneOf(['penghuni', 'admin']).isRequired,
  created_at: PropTypes.string,
});

export const reportShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  category: PropTypes.string,
  location: PropTypes.string,
  priority: PropTypes.string,
  status: PropTypes.string.isRequired,
  created_at: PropTypes.string,
  reporter: PropTypes.shape({ name: PropTypes.string }),
  permissions: PropTypes.shape({ nextStatuses: PropTypes.arrayOf(PropTypes.string) }),
});

export const optionShape = PropTypes.shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});
