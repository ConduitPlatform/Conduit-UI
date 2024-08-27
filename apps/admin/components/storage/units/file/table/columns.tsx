'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ConduitFile } from '@/lib/models/storage';
import moment from 'moment';
import { mimeTypeMapper } from '@/components/storage/units/file/utils/mimeTypeMapper';
import { MoreVertical, TrashIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FileDetails } from '@/components/storage/units/file/details';
import Decimal from 'decimal.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteFileById } from '@/lib/api/storage';

export const columns: ColumnDef<ConduitFile>[] = [
  {
    accessorKey: 'alias',
    header: 'File Name',
  },
  {
    accessorKey: 'size',
    header: 'File Size',
    cell: cell => {
      const size = cell.getValue() as number;
      return <span>{new Decimal(size).div(1024).toFixed(2)}KB</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Uploaded',
    cell: cell => {
      return (
        <span>
          {moment(cell.getValue() as string).format('DD/MM/YYYY HH:MM')}
        </span>
      );
    },
  },
  {
    accessorKey: 'isPublic',
    header: 'Public',
  },
  {
    accessorKey: 'mimeType',
    header: 'Type',
    cell: cell => {
      return <span>{mimeTypeMapper[cell.getValue() as string]}</span>;
    },
  },
  {
    accessorKey: 'details',
    header: '',
    cell: ({ row }) => {
      return (
        <Sheet>
          <SheetTrigger asChild>
            <button className="border-none">
              <MoreVertical width={16} height={16} />
            </button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-[650px]">
            <SheetHeader>
              <SheetTitle>Details</SheetTitle>
            </SheetHeader>
            <FileDetails file={row.original} />
          </SheetContent>
        </Sheet>
      );
    },
  },
  {
    accessorKey: 'delete',
    header: '',
    cell: ({ row }) => {
      const _id = row.original._id;
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button">
              <TrashIcon width={16} height={16} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                <span>Are you sure you want to delete this file?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={async () => deleteFileById(_id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
