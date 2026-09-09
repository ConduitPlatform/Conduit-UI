import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchResults } from './search-results';
import type { SemanticSearchHit } from '@/lib/models/embeddings/search';

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

afterEach(() => {
  cleanup();
});

const hits: SemanticSearchHit[] = [
  {
    document: {
      _id: 'doc_1',
      title: 'Alpha',
      password: 'super-secret',
      embedding: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    score: 0.9123,
    provider: 'postgres',
    distance: 0.1,
    metric: 'cosine',
  },
];

describe('SearchResults', () => {
  it('shows an empty match state without a table', () => {
    render(<SearchResults hits={[]} />);
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders scores and skips vector document columns', () => {
    render(<SearchResults hits={hits} />);
    expect(
      screen.getByText('1 result. Higher score is better.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /Result 1\. Score 0[.,]9123, higher is better, provider postgres/,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'embedding' })
    ).toBeNull();
    expect(
      screen.getByRole('columnheader', { name: 'title' })
    ).toBeInTheDocument();
    expect(screen.queryByText('super-secret')).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'password' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    expect(screen.queryByText('super-secret')).toBeNull();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});
