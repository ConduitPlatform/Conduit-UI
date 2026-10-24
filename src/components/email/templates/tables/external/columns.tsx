'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ExternalTemplate } from '@/lib/models/email';
import moment from 'moment/moment';

export const columns: ColumnDef<ExternalTemplate, any>[] = [
  {
    accessorKey: '_id',
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: false,
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created Date',
    enableSorting: false,
    cell: props => {
      return moment(props.getValue()).format('DD MMM YYYY');
    },
  },
];
