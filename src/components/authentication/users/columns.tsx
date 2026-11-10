'use client';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';
import {
  BadgeCheck,
  BadgeX,
  CheckIcon,
  Clipboard,
  Pencil,
  Trash,
  XCircle,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';
import { HomeRealmCell } from '@/components/authentication/users/homeRealmCell';

const baseColumns: ColumnDef<User>[] = [
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
    cell: ({ row }) => {
      const verified = row.original.isVerified;
      return (
        <span className="inline-flex">
          {verified ? (
            <CheckIcon className="h-4 w-4" aria-hidden />
          ) : (
            <XIcon className="h-4 w-4" aria-hidden />
          )}
          <span className="sr-only">
            {verified ? 'Verified' : 'Not verified'}
          </span>
        </span>
      );
    },
  },
];

function actionsColumn(
  onVerified?: (userId: string, isVerified: boolean) => void
): ColumnDef<User> {
  return {
    id: 'actions',
    cell: function CellComponent({ row }) {
      const user = row.original;
      const {
        openUserEdit,
        deleteUser,
        blockUser,
        unblockUser,
        setUserVerified,
      } = useUserActions();
      const nextVerified = !user.isVerified;
      const verifyLabel = nextVerified
        ? `Verify ${user.email}`
        : `Unverify ${user.email}`;

      return (
        <div className="flex flex-row">
          <Button
            variant="ghost"
            size="sm"
            title="edit"
            onClick={() => openUserEdit(user._id, user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={verifyLabel}
            aria-label={verifyLabel}
            onClick={() => {
              void setUserVerified(user, nextVerified).then(saved => {
                if (saved) onVerified?.(user._id, nextVerified);
              });
            }}
          >
            {nextVerified ? (
              <BadgeCheck className="h-4 w-4" aria-hidden />
            ) : (
              <BadgeX className="h-4 w-4" aria-hidden />
            )}
          </Button>
          {user.active ? (
            <Button
              variant="ghost"
              size="sm"
              title="block"
              onClick={() => blockUser(user._id)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              title="unblock"
              onClick={() => unblockUser(user._id)}
            >
              <CheckIcon className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            title="delete"
            onClick={() => deleteUser(user._id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  };
}

/** Columns for the users table. Home realm is inserted before the row actions. */
export function getUserColumns({
  showHomeRealm,
  realmSlugs,
  onVerified,
}: {
  showHomeRealm: boolean;
  realmSlugs?: ReadonlyMap<string, string>;
  /** Called after verification is saved, so the row updates before the refresh lands. */
  onVerified?: (userId: string, isVerified: boolean) => void;
}): ColumnDef<User>[] {
  const actions = actionsColumn(onVerified);
  if (!showHomeRealm) return [...baseColumns, actions];
  return [
    ...baseColumns,
    {
      accessorKey: 'homeRealm',
      header: 'Home realm',
      cell: ({ row }) => (
        <HomeRealmCell
          homeRealm={row.original.homeRealm}
          realmSlugs={realmSlugs}
        />
      ),
    },
    actions,
  ];
}
