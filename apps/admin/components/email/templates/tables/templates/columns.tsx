'use client';

import { ColumnDef } from '@tanstack/react-table';
import { EmailTemplate } from '@/lib/models/email';
import moment from 'moment/moment';
import { DeleteAlert } from '@/components/helpers/delete';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTemplate } from '@/lib/api/email';
import Link from 'next/link';
import { EyeIcon } from 'lucide-react';

export function useColumns() {
  const router = useRouter();
  return useMemo<ColumnDef<EmailTemplate, any>[]>(
    () => [
      {
        accessorKey: '_id',
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'externalManaged',
        header: 'External',
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created Date',
        cell: props => {
          return moment(props.getValue()).format('DD MMM YYYY');
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated Date',
        cell: props => {
          return moment(props.getValue()).format('DD MMM YYYY');
        },
      },
      {
        id: 'delete',
        header: '',
        cell: props => (
          <DeleteAlert
            title={'Delete Template'}
            description={`Are you sure you want to delete template ${props.row.original.name}?`}
            callback={() =>
              deleteTemplate(props.row.original._id).then(() =>
                router.refresh()
              )
            }
          />
        ),
      },
      {
        accessorKey: 'enter',
        header: '',
        enableSorting: false,
        cell: props => (
          <Link href={`/email/templates/${props.row.original._id}`}>
            <EyeIcon className="w-4 h-4" />
          </Link>
        ),
      },
    ],
    []
  );
}
