import Swal from 'sweetalert2';

export function confirmDanger({ title, text, confirmText = 'Ya, hapus' }) {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => result.isConfirmed);
}

export function toastSuccess(title) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

export function alertError(text) {
  return Swal.fire({ icon: 'error', title: 'Gagal', text, confirmButtonColor: '#1d4ed8' });
}
