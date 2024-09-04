'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChatRoom } from '@/lib/models/chat';
import { Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const columns: ColumnDef<ChatRoom, any>[] = [
  {
    accessorKey: '_id',
    header: '_id',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'participants',
    header: 'Participants',
    cell: props => <span>{props.getValue().length}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'deleted',
    header: '',
    enableSorting: false,
    cell: props => {
      return !props.getValue() ? (
        <button onClick={() => console.log('delete room')}>
          <Trash2Icon className="w-4 h-4" />
        </button>
      ) : (
        <>del</>
      );
    },
  },
  {
    accessorKey: 'enter',
    header: '',
    enableSorting: false,
    cell: props => (
      <Link href={`/chat/rooms/${props.row.original._id}`}>
        <Button variant={'secondary'}>enter</Button>
      </Link>
    ),
  },
];
