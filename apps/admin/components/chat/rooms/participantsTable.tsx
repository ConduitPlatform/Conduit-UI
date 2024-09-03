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
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

export function PotentialParticipants({
  users,
  columns,
}: {
  users: User[];
  columns: ColumnDef<User, any>[];
}) {
  const formRef = useFormContext();
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const selected = [];
    for (let key of Object.keys(rowSelection)) {
      selected.push(key);
    }
    formRef.setValue('participants', selected, { shouldValidate: true });
  }, [rowSelection]);

  const table = useReactTable({
    data: users,
    columns,
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
