import { ColumnDef } from '@tanstack/react-table';
import { ChatRoom } from '@/lib/models/chat';
import Link from 'next/link';
import { DeleteRoomAlert } from '@/components/chat/rooms/delete';
import { EyeIcon } from 'lucide-react';

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
        <DeleteRoomAlert roomIds={[props.row.original._id]} />
      ) : (
        <></>
      );
    },
  },
  {
    accessorKey: 'enter',
    header: '',
    enableSorting: false,
    cell: props => (
      <Link href={`/chat/rooms/${props.row.original._id}`}>
        <EyeIcon className="w-4 h-4" />
      </Link>
    ),
  },
];
