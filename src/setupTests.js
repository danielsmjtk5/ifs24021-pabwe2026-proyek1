import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// SweetAlert2 diganti mock agar dialog bisa dikendalikan dalam pengujian.
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
