import { useState } from 'react';
import FormField from '../../../components/FormField';
import useInput from '../../../hooks/useInput';
import { CATEGORIES, PRIORITIES, validateReport } from '../../../helpers/toolsHelper';
import PropTypes from 'prop-types';

const EMPTY = { title: '', category: '', location: '', description: '', priority: '' };

/**
 * Formulir laporan dipakai untuk membuat dan mengubah laporan. State formulir
 * cukup disimpan lokal; Redux hanya dipakai saat data dikirim ke API.
 */
function ReportForm({ initialValues = EMPTY, submitLabel, onSubmit, onCancel, serverErrors = {} }) {
  const [title, onTitleChange] = useInput(initialValues.title);
  const [category, onCategoryChange] = useInput(initialValues.category);
  const [location, onLocationChange] = useInput(initialValues.location);
  const [description, onDescriptionChange] = useInput(initialValues.description);
  const [priority, onPriorityChange] = useInput(initialValues.priority);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const shown = { ...serverErrors, ...errors };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const values = {
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      priority,
    };
    const found = validateReport(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    await onSubmit(values);
    setSubmitting(false);
  };

  return (
    <form className="card space-y-5 p-6" onSubmit={handleSubmit} noValidate>
      <FormField
        id="title"
        label="Judul laporan"
        placeholder="Contoh: Lampu kamar mandi mati"
        value={title}
        onChange={onTitleChange}
        error={shown.title}
        maxLength={100}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="category" as="select" label="Kategori kerusakan" value={category} onChange={onCategoryChange} error={shown.category}>
          <option value="">Pilih kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </FormField>
        <FormField id="priority" as="select" label="Tingkat prioritas" value={priority} onChange={onPriorityChange} error={shown.priority}>
          <option value="">Pilih prioritas</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </FormField>
      </div>
      <FormField
        id="location"
        label="Lokasi fasilitas"
        placeholder="Contoh: Gedung A Lantai 2, Kamar A-201"
        value={location}
        onChange={onLocationChange}
        error={shown.location}
        maxLength={100}
      />
      <FormField
        id="description"
        as="textarea"
        rows={5}
        label="Deskripsi kerusakan"
        placeholder="Jelaskan kerusakan, sejak kapan terjadi, dan dampaknya."
        value={description}
        onChange={onDescriptionChange}
        error={shown.description}
        hint={`${description.length}/1000 karakter`}
        maxLength={1000}
      />
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Batal
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

ReportForm.propTypes = {
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    category: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
  }),
  submitLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  serverErrors: PropTypes.objectOf(PropTypes.string),
};

export default ReportForm;
