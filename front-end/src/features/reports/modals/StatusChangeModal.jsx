import { useState } from 'react';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import useInput from '../../../hooks/useInput';
import { statusLabel, validateStatusChange } from '../../../helpers/toolsHelper';
import PropTypes from 'prop-types';
import { reportShape } from '../../../helpers/propShapes';

function StatusChangeModal({ report, onClose, onSubmit }) {
  const options = report.permissions.nextStatuses;
  const [status, onStatusChange] = useInput(options[0]);
  const [note, onNoteChange] = useInput('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateStatusChange({ status, note });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    const ok = await onSubmit({ status, note: note.trim() });
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Modal
      title="Ubah status laporan"
      description={`Status saat ini: ${statusLabel(report.status)}. Perubahan akan tercatat di riwayat.`}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField id="new-status" as="select" label="Status baru" value={status} onChange={onStatusChange} error={errors.status}>
          {options.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value)}
            </option>
          ))}
        </FormField>
        <FormField
          id="status-note"
          as="textarea"
          rows={3}
          label={status === 'ditolak' ? 'Alasan penolakan' : 'Catatan (opsional)'}
          placeholder="Contoh: Teknisi akan datang besok pagi."
          value={note}
          onChange={onNoteChange}
          error={errors.note}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan status'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

StatusChangeModal.propTypes = {
  report: reportShape.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default StatusChangeModal;
