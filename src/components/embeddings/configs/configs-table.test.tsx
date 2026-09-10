import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfigsEmpty } from './configs-table';

afterEach(() => {
  cleanup();
});

describe('ConfigsEmpty', () => {
  it('makes all three source types discoverable', () => {
    render(<ConfigsEmpty />);
    expect(screen.getByText('No embedding sources')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Database schema' })
    ).toHaveAttribute('href', '/embeddings/configs/new');
    expect(
      screen.getByRole('link', { name: 'Conduit Storage' })
    ).toHaveAttribute('href', '/embeddings/sources/new?kind=conduit-storage');
    expect(
      screen.getByRole('link', { name: 'External / custom' })
    ).toHaveAttribute('href', '/embeddings/sources/new?kind=external');
  });
});
