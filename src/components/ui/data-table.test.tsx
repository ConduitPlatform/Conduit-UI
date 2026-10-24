import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './data-table';
import { DATA_TABLE_PAGE_SIZE } from './data-table-pagination';

const push = vi.fn();
const searchParams = new URLSearchParams('skip=0&limit=10');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

afterEach(() => {
  cleanup();
  push.mockClear();
});

type Row = { name: string };

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

function rows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `row-${index + 1}`,
  }));
}

describe('DataTable pagination', () => {
  it('renders every provided row when count is set instead of client-slicing', () => {
    const extra = DATA_TABLE_PAGE_SIZE + 5;
    render(<DataTable columns={columns} data={rows(extra)} count={100} />);
    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText(`row-${extra}`)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(extra + 1);

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(push).toHaveBeenCalledWith('?skip=10&limit=10');
  });

  it('slices client-side when count is omitted', () => {
    render(
      <DataTable columns={columns} data={rows(DATA_TABLE_PAGE_SIZE + 2)} />
    );
    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText(`row-${DATA_TABLE_PAGE_SIZE}`)).toBeInTheDocument();
    expect(
      screen.queryByText(`row-${DATA_TABLE_PAGE_SIZE + 1}`)
    ).not.toBeInTheDocument();
  });
});
