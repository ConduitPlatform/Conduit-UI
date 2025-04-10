'use client';
import {
  ColumnDef,
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
  count: number;
  children: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  count,
  children,
}: Readonly<DataTableProps<TData, TValue>>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = useMemo(() => {
    const skip = searchParams.get('skip') ?? '0';
    const limit = searchParams.get('limit') ?? '10';
    return Math.ceil(parseInt(skip) / parseInt(limit)) + 1;
  }, [searchParams]);

  const tableData = useMemo(() => data, [data]);
  const pageCount = useMemo(() => Math.ceil(count / 10), [count]);
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Function to determine which page numbers to show
  // State to track which pages are visible
  const visiblePages = useMemo<
    (number | 'ellipsis-start' | 'ellipsis-end')[]
  >(() => {
    const newVisiblePages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    // Always show first page
    newVisiblePages.push(1);

    // Calculate the range of pages to show around the current page
    const siblingCount = 1; // Number of pages to show on each side of current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      pageCount - 1
    );

    // Determine if we need ellipsis on the left side
    const shouldShowLeftEllipsis = leftSiblingIndex > 2;

    // Determine if we need ellipsis on the right side
    const shouldShowRightEllipsis = rightSiblingIndex < pageCount - 1;

    // Add left ellipsis if needed
    if (shouldShowLeftEllipsis) {
      newVisiblePages.push('ellipsis-start');
    } else if (pageCount > 1) {
      // If we don't need ellipsis but page 2 exists, show it
      newVisiblePages.push(2);
    }

    // Add pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      // Only add if not already added (avoid duplicates with first/last page)
      if (i > 1 && i < pageCount && !newVisiblePages.includes(i)) {
        newVisiblePages.push(i);
      }
    }

    // Add right ellipsis if needed
    if (shouldShowRightEllipsis) {
      newVisiblePages.push('ellipsis-end');
    }

    // Always show last page if it exists
    if (pageCount > 1) {
      newVisiblePages.push(pageCount);
    }

    return newVisiblePages;
  }, [currentPage, pageCount]);

  // Handle clicking on ellipsis
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
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                  {children}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
                  className={'hover:cursor-pointer'}
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
    </>
  );
}
