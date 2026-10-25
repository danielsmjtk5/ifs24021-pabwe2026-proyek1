import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Brand from './Brand';

describe('Brand', () => {
  it('menampilkan nama aplikasi dalam varian gelap dan terang', () => {
    render(
      <>
        <Brand />
        <Brand light />
      </>,
    );
    expect(screen.getAllByText('AsramaCare')).toHaveLength(2);
  });
});
