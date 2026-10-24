import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DeclaredSchema } from '@/lib/models/database';
import { DataExplorer } from './index';

const replace = vi.fn();
const refresh = vi.fn();
const searchParams = new URLSearchParams(
  'search=%7B%22status%22%3A%22open%22%7D'
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace,
    refresh,
    push: vi.fn(),
  }),
  useSearchParams: () => searchParams,
}));

const schema = {
  _id: 'schema-1',
  name: 'Post',
  parentSchema: null,
  fields: { title: { type: 'String' }, views: { type: 'Number' } },
  compiledFields: { title: { type: 'String' }, views: { type: 'Number' } },
  extensions: [],
  modelOptions: {},
  ownerModule: 'database',
  collectionName: 'cnd_post',
  createdAt: '',
  updatedAt: '',
} as DeclaredSchema;

const documents = {
  documents: [
    { _id: 'a', title: 'Alpha', views: 1 },
    { _id: 'b', title: 'Beta', views: 2 },
  ],
  count: 50,
};

afterEach(() => {
  cleanup();
  replace.mockClear();
  refresh.mockClear();
});

describe('DataExplorer document search', () => {
  it('asks the server to search the collection instead of hiding loaded rows', () => {
    vi.useFakeTimers();
    render(<DataExplorer schema={schema} documents={documents} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Search documents' }),
      {
        target: { value: 'not-on-this-page' },
      }
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    vi.advanceTimersByTime(300);

    expect(replace).toHaveBeenCalledWith(
      '?search=%7B%22status%22%3A%22open%22%7D&q=not-on-this-page',
      { scroll: false }
    );
    expect(refresh).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
