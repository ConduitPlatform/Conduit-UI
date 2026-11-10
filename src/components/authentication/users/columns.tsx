'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  BadgeCheck,
  BadgeX,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clipboard,
  Pencil,
  Trash,
  XCircle,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useUserActions } from '@/components/authentication/users/UserActionsProvider';
import { HomeRealmCell } from '@/components/authentication/users/homeRealmCell';
import {
  formatRegistered,
  registeredTitle,
  statusLabel,
} from '@/lib/authentication/userColumns';
import type { UserSortField } from '@/lib/authentication/userListParams';
import { User } from '@/lib/models/User';

function SortHeader({
  label,
  field,
  sort,
  onSort,
}: Readonly<{
  label: string;
  field: UserSortField;
  sort?: string;
  onSort: (field: UserSortField) => void;
}>) {
  const descending = sort === `-${field}`;
  const active = sort === field || descending;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 gap-1 px-2 font-medium"
      onClick={() => onSort(field)}
    >
      {label}
      {active ? (
        descending ? (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        )
      ) : (
        <ChevronsUpDown
          className="h-3.5 w-3.5 text-muted-foreground"
          aria-hidden
        />
      )}
    </Button>
  );
}

function selectionColumn(): ColumnDef<User> {
  return {
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={value =>
          table.toggleAllPageRowsSelected(value === true)
        }
        aria-label="Select all users"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(value === true)}
        aria-label={`Select ${row.original.email || row.original._id}`}
      />
    ),
  };
}

function dataColumns(
  sort: string | undefined,
  onSort: (field: UserSortField) => void
): ColumnDef<User>[] {
  return [
    {
      accessorKey: '_id',
      enableSorting: false,
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
      enableSorting: true,
      header: () => (
        <SortHeader label="Email" field="email" sort={sort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <div className="max-w-56 truncate" title={row.original.email}>
          {row.original.email || '—'}
        </div>
      ),
    },
    {
      id: 'active',
      accessorKey: 'active',
      enableSorting: true,
      header: () => (
        <SortHeader label="Status" field="active" sort={sort} onSort={onSort} />
      ),
      cell: ({ row }) => {
        const label = statusLabel(row.original.active);
        return (
          <Badge variant={row.original.active ? 'secondary' : 'destructive'}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isVerified',
      enableSorting: true,
      header: () => (
        <SortHeader
          label="Verified"
          field="isVerified"
          sort={sort}
          onSort={onSort}
        />
      ),
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
    {
      accessorKey: 'createdAt',
      enableSorting: true,
      header: () => (
        <SortHeader
          label="Registered"
          field="createdAt"
          sort={sort}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (
        <span
          className="tabular-nums text-muted-foreground"
          title={registeredTitle(row.original.createdAt)}
        >
          {formatRegistered(row.original.createdAt)}
        </span>
      ),
    },
  ];
}

function actionsColumn(
  onVerified?: (userId: string, isVerified: boolean) => void
): ColumnDef<User> {
  return {
    id: 'actions',
    enableSorting: false,
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
            onClick={() => openUserEdit(user._id)}
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
  sort,
  onSort,
}: {
  showHomeRealm: boolean;
  realmSlugs?: ReadonlyMap<string, string>;
  /** Called after verification is saved, so the row updates before the refresh lands. */
  onVerified?: (userId: string, isVerified: boolean) => void;
  sort?: string;
  onSort: (field: UserSortField) => void;
}): ColumnDef<User>[] {
  const actions = actionsColumn(onVerified);
  const columns = [...dataColumns(sort, onSort)];
  if (showHomeRealm) {
    columns.push({
      accessorKey: 'homeRealm',
      enableSorting: false,
      header: 'Home realm',
      cell: ({ row }) => (
        <HomeRealmCell
          homeRealm={row.original.homeRealm}
          realmSlugs={realmSlugs}
        />
      ),
    });
  }
  return [selectionColumn(), ...columns, actions];
}
