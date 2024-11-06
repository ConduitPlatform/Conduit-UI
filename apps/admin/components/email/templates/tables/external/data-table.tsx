'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getExternalTemplates } from '@/lib/api/email';
import { ExternalTemplate } from '@/lib/models/email';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Decimal from 'decimal.js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/utils';

export type ExternalTemplatesResponse = Awaited<
  ReturnType<typeof getExternalTemplates>
>;

export const ExternalTemplatesTable = ({
  data,
  columns,
}: {
  data: ExternalTemplatesResponse;
  columns: ColumnDef<ExternalTemplate, any>[];
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('externalPageIndex')) ?? 0,
    pageSize: 10,
  });

  useEffect(() => {
    setPagination({
      pageIndex: Number(searchParams.get('externalPageIndex')) ?? 0,
      pageSize: 10,
    });
  }, []);

  useEffect(() => {
    const params = createQueryString(
      [
        {
          name: 'externalPageIndex',
          value: new Decimal(pagination.pageIndex).ceil().toString(),
        },
      ],
      searchParams.toString()
    );
    router.push(`${pathname}?${params}`);
  }, [pagination.pageIndex]);

  const table = useReactTable({
    data: data.templateDocuments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    pageCount: new Decimal(data.count).div(10).toNumber(),
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination,
    },
  });

  return (
    <>
      <Table className="mt-5">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() ? (
                            header.column.getIsSorted() === 'asc' ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDownIcon className="w-4 h-4" />
                          )
                        ) : (
                          <></>
                        )}
                      </div>
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
};
