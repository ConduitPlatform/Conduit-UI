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
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/utils';
import Decimal from 'decimal.js';

export function DataTable({
  docs,
  count,
  columns,
}: {
  docs: any[];
  count: number;
  columns: ColumnDef<any, any>[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
    pageSize: 19,
  });
  const router = useRouter();

  useEffect(() => {
    setPagination({
      pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
      pageSize: 19,
    });
  }, []);

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

  const table = useReactTable({
    data: docs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    pageCount: new Decimal(count).div(19).toNumber(),
    manualPagination: true,
    manualSorting: true,
    getRowId: row => row._id,
    state: {
      pagination,
    },
  });

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id} className="border">
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
                  <TableCell key={cell.id} className="border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="text-center">
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    No data
                  </h3>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
    </>
  );
}
