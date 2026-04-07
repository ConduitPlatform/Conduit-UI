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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/utils';
import Decimal from 'decimal.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentEditorButton } from '@/components/database/docs/document-editor-button';
import { DeclaredSchema } from '@/lib/models/database';

export function DataTable({
  docs,
  count,
  columns,
  schema,
}: {
  docs: any[];
  count: number;
  columns: ColumnDef<any, any>[];
  schema: DeclaredSchema;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [limit, setLimit] = useState(
    searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
  );
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
    pageSize: limit,
  });
  const router = useRouter();
  const [hasOverflow, setHasOverflow] = useState(false);
  type Density = 'compact' | 'comfortable' | 'spacious';
  const [density, setDensity] = useState<Density>('comfortable');
  const densityClasses: Record<Density, { header: string; cell: string }> = {
    compact: { header: 'h-8 px-2 py-1.5', cell: 'px-2 py-1.5' },
    comfortable: { header: 'h-10 px-3 py-2', cell: 'px-3 py-2.5' },
    spacious: { header: 'h-12 px-4 py-3', cell: 'px-4 py-4' },
  };
  const { header: headerDensity, cell: cellDensity } = densityClasses[density];

  useEffect(() => {
    setPagination({
      pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
      pageSize: limit,
    });
  }, []);

  // Check for horizontal overflow
  useEffect(() => {
    const checkOverflow = () => {
      const tableContainer = document.querySelector('.table-scroll-container');
      if (tableContainer) {
        setHasOverflow(tableContainer.scrollWidth > tableContainer.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [docs]);

  useEffect(() => {
    const params = createQueryString(
      [
        {
          name: 'pageIndex',
          value: new Decimal(pagination.pageIndex).ceil().toString(),
        },
      ],
      searchParams.toString()
    );
    router.push(`${pathname}?${params}`);
  }, [pagination.pageIndex]);

  useEffect(() => {
    const params = createQueryString(
      [
        {
          name: 'pageIndex',
          value: '0',
        },
        {
          name: 'limit',
          value: limit.toString(),
        },
      ],
      searchParams.toString()
    );
    router.push(`${pathname}?${params}`);
  }, [limit]);

  // Add document editor column
  const columnsWithActions = [
    ...columns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <DocumentEditorButton document={row.original} schema={schema} />
      ),
    },
  ];

  const table = useReactTable({
    data: docs,
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    pageCount: new Decimal(count).div(limit).toNumber(),
    manualPagination: true,
    manualSorting: true,
    getRowId: row => row._id,
    state: {
      pagination,
    },
  });

  const explicitPages: number[] = [];
  for (
    let p = table.getState().pagination.pageIndex - 1;
    p < table.getPageCount() && explicitPages.length < 4;
    p++
  ) {
    if (p < 2) {
      continue;
    }
    explicitPages.push(p);
  }

  const pages = (
    <div className="flex gap-x-3">
      <PaginationItem>
        <PaginationLink
          className="cursor-pointer"
          onClick={() => table.setPageIndex(0)}
          isActive={0 === table.getState().pagination.pageIndex}
        >
          {1}
        </PaginationLink>
      </PaginationItem>
      {pagination.pageIndex > 3 && <PaginationEllipsis />}
      {explicitPages.map(p => (
        <PaginationItem key={`page-${p}`}>
          <PaginationLink
            className="cursor-pointer"
            isActive={table.getState().pagination.pageIndex === p - 1}
            onClick={() => table.setPageIndex(p - 1)}
          >
            {new Decimal(p).ceil().toNumber()}
          </PaginationLink>
        </PaginationItem>
      ))}
      {pagination.pageIndex < table.getPageCount() - 3 && (
        <PaginationEllipsis />
      )}
      {table.getPageCount() > 1 && (
        <PaginationItem>
          <PaginationLink
            className="cursor-pointer"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            isActive={
              table.getPageCount() - 1 === table.getState().pagination.pageIndex
            }
          >
            {new Decimal(table.getPageCount()).ceil().toNumber()}
          </PaginationLink>
        </PaginationItem>
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Table container with sticky header and scrollable body */}
      <div className="flex-1 overflow-hidden relative">
        <div className="table-scroll-container relative overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scroll-smooth h-full">
          {/* Scroll indicator overlay */}
          {hasOverflow && (
            <>
              <div className="absolute top-0 left-0 w-4 h-full bg-linear-to-r from-background/80 to-transparent pointer-events-none z-30" />
              <div className="absolute top-0 right-0 w-4 h-full bg-linear-to-l from-background/80 to-transparent pointer-events-none z-30" />
            </>
          )}

          {/* Use direct table element to avoid wrapper div interference */}
          <table
            className="w-full border-collapse caption-bottom text-sm"
            style={{ minWidth: '1200px', tableLayout: 'fixed', width: '100%' }}
          >
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr
                  key={headerGroup.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {headerGroup.headers.map((header, index) => {
                    const isFirstColumn = index === 0; // _id column
                    const isLastColumn =
                      index === headerGroup.headers.length - 1; // Last column (actions)
                    const isSticky = isFirstColumn || isLastColumn;

                    return (
                      <th
                        key={header.id}
                        className={`${headerDensity} text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 border whitespace-nowrap bg-background ${
                          isSticky ? 'sticky' : ''
                        } ${isFirstColumn ? 'left-0' : ''} ${
                          isLastColumn ? 'right-0' : ''
                        }`}
                        style={{
                          width: isLastColumn
                            ? '100px'
                            : header.id === '_id'
                              ? '150px'
                              : '180px',
                          minWidth: isLastColumn ? '100px' : '120px',
                          maxWidth: isLastColumn ? '100px' : '250px',
                          position: 'sticky',
                          top: 0,
                          zIndex: 40,
                          backgroundColor: 'hsl(var(--background))',
                          ...(isFirstColumn && {
                            left: 0,
                            zIndex: 50, // Higher than header z-index
                          }),
                          ...(isLastColumn && {
                            right: 0,
                            zIndex: 50,
                            boxShadow: 'var(--shadow-sticky-reverse)',
                            transform: 'translateZ(0)',
                          }),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      const isFirstColumn = index === 0; // _id column
                      const isLastColumn =
                        index === row.getVisibleCells().length - 1; // Last column (actions)
                      const isSticky = isFirstColumn || isLastColumn;

                      return (
                        <td
                          key={cell.id}
                          className={`${cellDensity} align-middle [&:has([role=checkbox])]:pr-0 border bg-background ${
                            isSticky ? 'sticky' : ''
                          } ${isFirstColumn ? 'left-0' : ''} ${
                            isLastColumn ? 'right-0' : ''
                          }`}
                          style={{
                            width: isLastColumn
                              ? '100px'
                              : cell.column.id === '_id'
                                ? '150px'
                                : '180px',
                            minWidth: isLastColumn ? '100px' : '120px',
                            maxWidth: isLastColumn ? '100px' : '250px',
                            ...(isFirstColumn && {
                              position: 'sticky',
                              left: 0,
                              zIndex: 30,
                            }),
                            ...(isLastColumn && {
                              position: 'sticky',
                              right: 0,
                              zIndex: 30,
                              backgroundColor: 'hsl(var(--background))',
                              boxShadow: 'var(--shadow-sticky-reverse)',
                              transform: 'translateZ(0)',
                            }),
                          }}
                        >
                          <div className="truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td
                    colSpan={columns.length + 1}
                    className="h-24 text-center px-3 py-2.5 align-middle [&:has([role=checkbox])]:pr-0"
                  >
                    <div className="text-center">
                      <h3 className="mt-2 text-sm font-semibold text-foreground">
                        No data
                      </h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky pagination at the bottom */}
      <div className="flex items-center justify-center gap-2 py-2 px-3 bg-background border-t shrink-0">
        <Pagination className="w-fit mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={`${!table.getCanPreviousPage() ? 'opacity-50 cursor-disabled' : 'cursor-pointer'}`}
                onClick={() => table.previousPage()}
              />
            </PaginationItem>
            <div className="my-2">{pages}</div>
            <PaginationItem>
              <PaginationNext
                className={`${!table.getCanNextPage() ? 'opacity-50 cursor-disabled' : 'cursor-pointer'}`}
                onClick={() => table.nextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <Select
          value={density}
          onValueChange={value => setDensity(value as Density)}
        >
          <SelectTrigger className="w-fit min-w-28">
            <SelectValue placeholder="Density" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={value => {
            setLimit(Number(value));
          }}
          value={limit.toString()}
          defaultValue={'20'}
        >
          <SelectTrigger className="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'10'}>Show 10</SelectItem>
            <SelectItem value={'20'}>Show 20</SelectItem>
            <SelectItem value={'40'}>Show 40</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
