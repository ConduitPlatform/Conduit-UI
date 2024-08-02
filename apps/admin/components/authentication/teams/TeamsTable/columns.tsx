'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRightIcon, CheckIcon, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Team } from '@/lib/models/Team';
import Link from 'next/link';

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (cell) => {
      return <div className={'flex flex-row'}>
        {cell.getValue() as string}
        {
          cell.row.original.isDefault && <span
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
    Default
  </span>
        }
      </div>;
    },
  },
  {
    accessorKey: '_id',
    header: 'Team ID',
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
    accessorKey: 'parentTeam',
    header: 'Parent Team ID',
    cell: (cell) => {
      return cell.getValue() ? <CheckIcon className={'w-4 h-4'} /> : <span> - </span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <Link href={`/authentication/teams/${row.original._id}`}>
        <Button variant={'ghost'} size={'sm'} title='edit'>
          Manage <ArrowRightIcon className={'w-4 h-4'} />
        </Button>
      </Link>;

    },
  },
];
