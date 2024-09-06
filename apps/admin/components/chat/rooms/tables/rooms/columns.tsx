import { ColumnDef } from '@tanstack/react-table';
import { ChatRoom } from '@/lib/models/chat';
import Link from 'next/link';
import { DeleteAlert } from '@/components/chat/helpers/delete';
import { EyeIcon } from 'lucide-react';
import { deleteRooms } from '@/lib/api/chat';
import { useRouter } from 'next/navigation';

export const columns = (): ColumnDef<ChatRoom, any>[] => {
  const router = useRouter();
  return [
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
          <DeleteAlert
            title={'Delete Room'}
            description={`Are you sure you want to delete room ${props.row.original.name}?`}
            callback={() =>
              deleteRooms([props.row.original._id]).then(() => router.refresh())
            }
          />
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
};
