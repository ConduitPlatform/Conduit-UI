import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SourceStatusCard } from './source-status-card';
import { IngestInstructions } from './ingest-instructions';
import type { EmbeddingSourceStatus } from '@/lib/models/embeddings/source';

afterEach(() => {
  cleanup();
});

const status: EmbeddingSourceStatus = {
  source: {
    _id: 'src_1',
    kind: 'conduit-storage',
    state: 'ready',
    partitionSubject: 'Team:org',
    provider: 'openai-compatible',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    similarity: 'cosine',
    metadataAllowlist: [],
  },
  ready: true,
  pendingCount: 0,
  queuedCount: 2,
  extractingCount: 1,
  indexedCount: 4,
  skippedCount: 0,
  failedCount: 1,
  staleCount: 0,
  deletedCount: 0,
  extractionQueue: {
    waiting: 1,
    active: 0,
    completed: 3,
    failed: 2,
    delayed: 1,
    paused: 0,
  },
  warnings: ['Chunk index status is pending'],
};

describe('source status and ingest instructions', () => {
  it('renders counts, failures, and empty/error states', () => {
    const { rerender } = render(<SourceStatusCard status={status} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Queued')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/failed or retrying/)).toBeInTheDocument();
    rerender(<SourceStatusCard error="Status unavailable" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Status unavailable');
    rerender(<SourceStatusCard />);
    expect(screen.getByText('Loading status…')).toBeInTheDocument();
  });

  it('shows trusted ingest guidance without a browser uploader', () => {
    render(
      <IngestInstructions
        source={{
          _id: 'src_ext',
          kind: 'external',
          state: 'ready',
          partitionSubject: 'Team:org',
          provider: 'openai-compatible',
          model: 'text-embedding-3-small',
          dimensions: 1536,
          similarity: 'cosine',
          metadataAllowlist: [],
        }}
      />
    );
    expect(
      screen.getByText('POST /embeddings/sources/src_ext/documents')
    ).toBeInTheDocument();
    expect(screen.getByText(/syncDocument/)).toBeInTheDocument();
    expect(screen.queryByText(/upload/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /upload/i })).toBeNull();
    expect(screen.queryByText(/OneDrive/i)).toBeNull();
    expect(screen.queryByText(/BM25/i)).toBeNull();
  });
});
