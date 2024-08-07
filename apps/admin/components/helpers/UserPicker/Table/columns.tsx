'use client';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';
import { Clipboard } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    enableHiding: false,
    enableSorting: false,
    cell: props => (
      <Checkbox
        aria-label="Select row"
        checked={props.row.getIsSelected()}
        onCheckedChange={value => props.row.toggleSelected(!!value)}
        className={'mx-2.5 border-border-dark-gray shadow-inherit'}
      />
    ),
  },
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
];
