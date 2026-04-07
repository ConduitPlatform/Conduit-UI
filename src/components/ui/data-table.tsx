'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count?: number;
  children?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  count,
  children,
}: Readonly<DataTableProps<TData, TValue>>) {
  const isServerPaginated = count !== undefined;

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = useMemo(() => {
    if (!isServerPaginated) return 1;
    const skip = searchParams.get('skip') ?? '0';
    const limit = searchParams.get('limit') ?? '10';
    return Math.ceil(parseInt(skip) / parseInt(limit)) + 1;
  }, [searchParams, isServerPaginated]);

  const tableData = useMemo(() => data, [data]);
  const pageCount = useMemo(
    () => (isServerPaginated ? Math.ceil(count! / 10) : undefined),
    [count, isServerPaginated]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const visiblePages = useMemo<
    (number | 'ellipsis-start' | 'ellipsis-end')[]
  >(() => {
    if (!isServerPaginated || !pageCount) return [];
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    pages.push(1);

    const siblingCount = 1;
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      pageCount - 1
    );

    if (leftSiblingIndex > 2) {
      pages.push('ellipsis-start');
    } else if (pageCount > 1) {
      pages.push(2);
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i > 1 && i < pageCount && !pages.includes(i)) {
        pages.push(i);
      }
    }

    if (rightSiblingIndex < pageCount - 1) {
      pages.push('ellipsis-end');
    }

    if (pageCount > 1) {
      pages.push(pageCount);
    }

    return pages;
  }, [currentPage, pageCount, isServerPaginated]);

  const handlePaginationClick = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('skip', (pageIndex * 10).toString());
    params.set('limit', '10');
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {children ?? (
                    <div className="text-center">
                      <h3 className="mt-2 text-sm font-semibold text-foreground">
                        No data
                      </h3>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isServerPaginated ? (
        <div className="flex items-center justify-end py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePaginationClick(currentPage - 2)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Go to previous page</span>
                </Button>
              </PaginationItem>

              {visiblePages.map((page, index) =>
                page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                  <PaginationItem key={`${page}-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem
                    key={`page-${page}`}
                    className="hover:cursor-pointer"
                  >
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => handlePaginationClick(page - 1)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePaginationClick(currentPage)}
                  disabled={currentPage === pageCount}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Go to next page</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
