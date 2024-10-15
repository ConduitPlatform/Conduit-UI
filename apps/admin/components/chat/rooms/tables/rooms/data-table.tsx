'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getRooms } from '@/lib/api/chat';
import { ChatRoom } from '@/lib/models/chat';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Decimal from 'decimal.js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROOMS_LIMIT } from '@/components/chat/rooms/tables/rooms/utils';
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { createQueryString } from '@/lib/utils';

export type ChatRoomsResponse = Awaited<ReturnType<typeof getRooms>>;

export function RoomsDataTable({
  data,
  columns,
}: {
  data: ChatRoomsResponse;
  columns: ColumnDef<ChatRoom, any>[];
}) {
  // TODO: decouple pagination logic from table
  // TODO: create a reusable table component (sorting)

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
    pageSize: ROOMS_LIMIT,
  });
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  useEffect(() => {
    const sort = searchParams.get('sort') as string | null;
    if (!sort) return;
    const params = sort.split(',').map(value => {
      const name = value.replace('-', '');
      const desc = value.split('-');
      return { id: name, desc: !!desc.length };
    });
    setSorting(params);
  }, []);

  useEffect(() => {
    setPagination({
      pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
      pageSize: ROOMS_LIMIT,
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
    if (!sorting.length) return;
    const sortingParams = sorting.map(param => {
      const value = `${param.desc ? '-' : ''}${param.id}`;
      return { name: 'sort', value };
    });
    const params = createQueryString(
      [{ name: 'pageIndex', value: '0' }, ...sortingParams],
      searchParams.toString()
    );
    router.push(`${pathname}?${params}`);
  }, [sorting]);

  const table = useReactTable({
    data: data.chatRoomDocuments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    pageCount: new Decimal(data.count).div(ROOMS_LIMIT).toNumber(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    state: {
      sorting,
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
}