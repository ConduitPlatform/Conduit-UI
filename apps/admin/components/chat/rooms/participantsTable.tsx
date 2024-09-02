'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User } from '@/lib/models/User';
import { useFormContext } from 'react-hook-form';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

export function PotentialParticipants({ users }: { users: User[] }) {
  const formRef = useFormContext();
  const [rowSelection, setRowSelection] = useState({});
  const [creatorSelection, setCreatorSelection] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const selected = [];
    for (let key of Object.keys(rowSelection)) {
      selected.push(key);
    }
    formRef.setValue('participants', selected, { shouldValidate: true });
  }, [rowSelection]);

  useEffect(() => {
    formRef.setValue('creator', creatorSelection, { shouldValidate: true });
  }, [creatorSelection]);

  const table = useReactTable({
    data: users,
    columns: [
      {
        id: 'select',
        enableSorting: false,
        cell: props => (
          <Checkbox
            aria-label="Select row"
            checked={props.row.getIsSelected()}
            onCheckedChange={value => {
              props.row.toggleSelected(!!value);
              if (!value && creatorSelection === props.row.original._id) {
                setCreatorSelection(undefined);
                formRef.setValue('creator', undefined, {
                  shouldValidate: true,
                });
              }
            }}
            className={'mx-2.5 border-border-dark-gray shadow-inherit'}
          />
        ),
      },
      {
        accessorKey: '_id',
        header: 'Select Creator',
        enableSorting: false,
        cell: props => (
          <Switch
            disabled={!props.row.getIsSelected()}
            checked={formRef.watch('creator') === props.row.getValue('_id')}
            onCheckedChange={() => {
              setCreatorSelection(props.row.getValue('_id'));
            }}
          />
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: row => row._id,
    state: {
      rowSelection,
    },
  });

  return (
    <Table>
      <TableCaption>A list of platform users.</TableCaption>
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className="h-24 text-center">
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
  );
}
