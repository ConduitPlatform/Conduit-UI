'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Clipboard, EditIcon, SendIcon, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FunctionModel } from '@/lib/models/functions';

export const columns: ColumnDef<FunctionModel>[] = [
  {
    accessorKey: '_id',
    header: 'ID',
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
    accessorKey: 'name',
    header: 'Name',
    cell: cell => {
      return (
        <div className={'flex flex-row group'}>
          <span className={'truncate w-32'}>{cell.getValue() as string}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'functionType',
    header: 'Type',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className={'flex flex-row'}>
          <Link href={`/functions/edit?function=${row.original._id}`}>
            <EditIcon className={'w-4 h-4'} />
          </Link>
          <Link href={`/functions/test?function=${row.original._id}`}>
            <SendIcon className={'w-4 h-4'} />
          </Link>
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
