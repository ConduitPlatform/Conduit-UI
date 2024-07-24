'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Clipboard, SendIcon, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';
import Link from 'next/link';

export const columns: ColumnDef<NotificationToken>[] = [
  {
    accessorKey: '_id',
    header: 'ID',
    cell: (cell) => {
      return <div className={'flex flex-row group'}>
        {cell.getValue() as string}
        <Clipboard className={'w-4 h-4 ml-2 invisible group-hover:visible cursor-pointer '} onClick={() => {
          navigator.clipboard.writeText(cell.getValue() as string);
        }} />

      </div>;
    },
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: (cell) => {
      return <div className={'flex flex-row group'}>
        <span className={'truncate w-32'}>
          {cell.getValue() as string}
        </span>
        <Clipboard className={'w-4 h-4 ml-2 invisible group-hover:visible cursor-pointer '} onClick={() => {
          navigator.clipboard.writeText(cell.getValue() as string);
        }} />
      </div>;
    },
  },
  {
    accessorKey: 'platform',
    header: 'Source',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <div className={'flex flex-row'}>
        <Link href={`/push-notifications/test?token=${row.original._id}`}>
          <SendIcon className={'w-4 h-4'} />
        </Link>
        <Button variant={'ghost'} size={'sm'} className={'text-destructive'} title='delete'>
          <Trash className={'w-4 h-4'} />
        </Button>
      </div>;
    },
  },
];
