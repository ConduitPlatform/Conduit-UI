'use client';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';
import {
  CheckIcon,
  Clipboard,
  Pencil,
  Trash,
  XCircle,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';

export const columns: ColumnDef<User>[] = [
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
    accessorKey: 'isVerified',
    header: 'Verified',
    cell: cell => {
      return cell.getValue() ? (
        <CheckIcon className={'w-4 h-4'} />
      ) : (
        <XIcon className={'w-4 h-4'} />
      );
    },
  },
  {
    id: 'actions',
    cell: function CellComponent({ row }) {
      const user = row.original;
      const { openUserEdit, deleteUser, blockUser, unblockUser } =
        useUserActions();

      return (
        <div className={'flex flex-row'}>
          <Button
            variant={'ghost'}
            size={'sm'}
            title="edit"
            onClick={() => openUserEdit(user._id)}
          >
            <Pencil className={'w-4 h-4'} />
          </Button>
          {user.active ? (
            <Button
              variant={'ghost'}
              size={'sm'}
              title="block"
              onClick={() => blockUser(user._id)}
            >
              <XCircle className={'w-4 h-4'} />
            </Button>
          ) : (
            <Button
              variant={'ghost'}
              size={'sm'}
              title="unblock"
              onClick={() => unblockUser(user._id)}
            >
              <CheckIcon className={'w-4 h-4'} />
            </Button>
          )}

          <Button
            variant={'ghost'}
            size={'sm'}
            className={'text-destructive'}
            title="delete"
            onClick={() => deleteUser(user._id)}
          >
            <Trash className={'w-4 h-4'} />
          </Button>
        </div>
      );
    },
  },
];
