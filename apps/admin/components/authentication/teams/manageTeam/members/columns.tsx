'use client';
import { ColumnDef } from '@tanstack/react-table';
import { TeamUser } from '@/lib/models/User';
import { Clipboard, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<TeamUser>[] = [
  {
    accessorKey: '_id',
    header: 'User ID',
    cell: cell => {
      return (
        <div className={'flex flex-row group'}>
          {cell.getValue() as string}
          <Clipboard
            className={
              'w-4 h-4 ml-2 invisible group-hover:visible cursor-pointer '
            }
            onClick={() => {
              navigator.clipboard.writeText(cell.getValue() as string);
            }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className={'flex flex-row'}>
          <Button variant={'ghost'} size={'sm'} title="edit">
            <Pencil className={'w-4 h-4'} />
          </Button>
          <Button
            variant={'ghost'}
            size={'sm'}
            className={'text-destructive'}
            title="delete"
          >
            <Trash className={'w-4 h-4'} />
          </Button>
        </div>
      );
    },
  },
];
