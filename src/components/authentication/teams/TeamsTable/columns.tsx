'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRightIcon, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Team } from '@/lib/models/Team';
import Link from 'next/link';

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: cell => {
      const team = cell.row.original;
      return (
        <div className={'flex flex-row items-center gap-2'}>
          {cell.getValue() as string}
          {team.isDefault && (
            <span className="inline-flex items-center rounded-full bg-callout-success-muted px-2.5 py-0.5 text-xs font-medium text-callout-success-foreground">
              Default
            </span>
          )}
          {team.realm?.enabled && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-callout-info-muted px-2.5 py-0.5 text-xs font-medium text-callout-info-foreground"
              title="This team is an authentication realm"
            >
              Realm
              {team.realm.slug && (
                <span className="font-mono">{team.realm.slug}</span>
              )}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: '_id',
    header: 'Team ID',
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
    accessorKey: 'parentTeam',
    header: 'Parent Team ID',
    cell: cell => {
      const val: string = cell.getValue() as string;
      if (!val) {
        return <span>-</span>;
      }
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
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Link href={`/authentication/teams/${row.original._id}`}>
          <Button variant={'ghost'} size={'sm'} title="edit">
            Manage <ArrowRightIcon className={'w-4 h-4'} />
          </Button>
        </Link>
      );
    },
  },
];
