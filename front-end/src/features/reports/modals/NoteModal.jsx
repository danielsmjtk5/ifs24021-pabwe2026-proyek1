import { useState } from 'react';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import useInput from '../../../hooks/useInput';
import { validateNote } from '../../../helpers/toolsHelper';

function NoteModal({ onClose, onSubmit }) {
  const [note, onNoteChange] = useInput('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateNote({ note });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    const ok = await onSubmit({ note: note.trim() });
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Tambah catatan tindak lanjut" description="Catatan dapat dilihat oleh pelapor." onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="follow-up-note"
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

export default NoteModal;
