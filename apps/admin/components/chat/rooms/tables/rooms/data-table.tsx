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
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Decimal from 'decimal.js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
//@ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateRoomForm } from '@/components/chat/rooms/createForm';
import { ROOMS_LIMIT } from '@/components/chat/rooms/tables/rooms/utils';
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from 'lucide-react';

type ChatRoomsResponse = Awaited<ReturnType<typeof getRooms>>;

export function RoomsTable({
  data,
  columns,
}: {
  data: ChatRoomsResponse;
  columns: ColumnDef<ChatRoom, any>[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(
    searchParams.get('search') ?? ''
  );
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
    pageSize: ROOMS_LIMIT,
  });
  const [sorting, setSorting] = useState<ColumnSort[]>(
    searchParams.get('sort')
      ? [
          {
            id: searchParams.get('sort') as string,
            desc: Boolean(searchParams.get('desc')!),
          },
        ]
      : []
  );

  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams.get('search')]);

  const createQueryString = useCallback(
    (queryParams: { name: string; value: string }[]) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const p of queryParams) {
        params.set(p.name, p.value);
      }
      return params.toString();
    },
    [pagination]
  );

  useEffect(() => {
    router.replace(
      `${pathname}?${createQueryString([
        {
          name: 'pageIndex',
          value: pagination.pageIndex.toString(),
        },
      ])}`
    );
  }, [pagination.pageIndex]);

  useEffect(() => {
    if (!sorting.length) return;
    router.replace(
      `${pathname}?${createQueryString([
        { name: 'sort', value: sorting[0].id },
        { name: 'desc', value: String(sorting[0].desc) },
      ])}`
    );
  }, [sorting]);

  const table = useReactTable({
    data: data.chatRoomDocuments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    pageCount: new Decimal(data.count).div(1).toNumber(),
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
      <div className="w-full flex justify-between">
        <Input
          placeholder={'Search By Name'}
          className={'w-44'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Room</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-fit'}>
            <DialogHeader>
              <DialogTitle>Create Room</DialogTitle>
            </DialogHeader>
            <CreateRoomForm callback={() => setOpen(!open)} />
          </DialogContent>
        </Dialog>
      </div>
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
