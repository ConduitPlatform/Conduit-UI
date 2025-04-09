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
  const [limit, setLimit] = useState(
    searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
  );
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
    pageSize: limit,
  });
  const router = useRouter();

  useEffect(() => {
    setPagination({
      pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
      pageSize: limit,
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

  const table = useReactTable({
    data: docs,
    columns,
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
      <div className="flex items-center justify-center space-x-3 my-2">
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
    </>
  );
}
