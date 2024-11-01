'use client';

import {
  ColumnDef,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { deleteTemplates, getTemplates } from '@/lib/api/email';
import { EmailTemplate } from '@/lib/models/email';
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
import { useToast } from '@/lib/hooks/use-toast';

export type EmailTemplatesResponse = Awaited<ReturnType<typeof getTemplates>>;

export const TemplatesTable = ({
  data,
  columns,
}: {
  data: EmailTemplatesResponse;
  columns: ColumnDef<EmailTemplate, any>[];
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [pagination, setPagination] = useState({
    pageIndex: Number(searchParams.get('pageIndex')) ?? 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
      pageSize: 10,
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
    data: data.templateDocuments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    pageCount: new Decimal(data.count).div(10).toNumber(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: row => row._id,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
  });

  return (
    <div className="static">
      {(table.getIsSomePageRowsSelected() ||
        table.getIsAllPageRowsSelected()) && (
        <div className="absolute inset-x-1/2 bottom-10 text-sm text-black w-full">
          <div className="inline-flex gap-x-5 items-center rounded-3xl px-5 py-2.5 shadow bg-gray-100">
            <span>{Object.keys(rowSelection).length} Selected</span>
            <button
              className="border border-input px-2 py-1 rounded-md font-medium ring-offset-background"
              type="button"
              onClick={() =>
                deleteTemplates(Object.keys(rowSelection))
                  .then(() => {
                    router.refresh();
                    toast({
                      title: 'Email',
                      description: 'Templates deleted successfully',
                    });
                  })
                  .catch(err =>
                    toast({ title: 'Email', description: err.message })
                  )
              }
            >
              Delete
            </button>
          </div>
        </div>
      )}
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
                onClick={row.getToggleSelectedHandler()}
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
    </div>
  );
};
