import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchResults } from './search-results';
import type { SemanticSearchHit } from '@/lib/models/embeddings/search';

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

const hits: SemanticSearchHit[] = [
  {
    document: {
      _id: 'doc_1',
      title: 'Alpha',
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
  });
});
