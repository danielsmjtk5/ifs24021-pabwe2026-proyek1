import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import useFormSubmit from '../../../hooks/useFormSubmit';
import useInput from '../../../hooks/useInput';
import { validateNote } from '../../../helpers/toolsHelper';
import PropTypes from 'prop-types';

function NoteModal({ onClose, onSubmit }) {
  const [note, onNoteChange] = useInput('');
  const { errors, submitting, handleSubmit } = useFormSubmit({
    getValues: () => ({ note: note.trim() }),
    validate: validateNote,
    submit: onSubmit,
    onSuccess: onClose,
  });

  return (
    <Modal title="Tambah catatan tindak lanjut" description="Catatan dapat dilihat oleh pelapor." onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          as="textarea"
          rows={4}
          label="Catatan"
          placeholder="Contoh: Suku cadang sedang dipesan, estimasi 3 hari."
          value={note}
          onChange={onNoteChange}
          error={errors.note}
        />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan catatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

NoteModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default NoteModal;
