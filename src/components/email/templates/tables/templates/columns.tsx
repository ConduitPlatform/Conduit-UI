'use client';

import { ColumnDef } from '@tanstack/react-table';
import { EmailTemplate } from '@/lib/models/email';
import moment from 'moment/moment';
import { DeleteAlert } from '@/components/helpers/delete';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTemplate, uploadTemplate } from '@/lib/api/email';
import Link from 'next/link';
import {
  EyeIcon,
  UploadCloud,
  Code,
  Palette,
  ExternalLink,
} from 'lucide-react';
import {
  canUseVisualEditor,
  isExternallyManaged,
} from '@/lib/utils/template-utils';
import { useToast } from '@/lib/hooks/use-toast';
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
import { Checkbox } from '@/components/ui/checkbox';

export function useColumns() {
  const router = useRouter();
  const { toast } = useToast();
  return useMemo<ColumnDef<EmailTemplate, any>[]>(
    () => [
      {
        id: 'select-col',
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()
              }
              onClick={() => table.toggleAllRowsSelected()}
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={() => {
              return row.getToggleSelectedHandler();
            }}
          />
        ),
      },
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
        header: 'Type',
        enableSorting: false,
        cell: props => {
          const template = props.row.original;
          if (isExternallyManaged(template)) {
            return (
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-orange-500" />
                <span className="text-sm">External</span>
              </div>
            );
          } else if (canUseVisualEditor(template)) {
            return (
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-green-500" />
                <span className="text-sm">Visual</span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Code</span>
              </div>
            );
          }
        },
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
              deleteTemplate(props.row.original._id)
                .then(() => router.refresh())
                .catch(err =>
                  toast({ title: 'Email', description: err.message })
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
      {
        accessorKey: 'push',
        header: '',
        enableSorting: false,
        cell: props => (
          <AlertDialog>
            <AlertDialogTrigger>
              <button type="button">
                <UploadCloud className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Upload Template</AlertDialogTitle>
                <AlertDialogDescription>
                  <span>
                    Are you sure you want to push this template to email
                    provider?
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () =>
                    uploadTemplate(props.row.original._id)
                      .then(() => {
                        toast({
                          title: 'Email',
                          description: 'Template uploaded successfully',
                        });
                        router.refresh();
                      })
                      .catch(err =>
                        toast({
                          title: 'Email',
                          description: err.message,
                        })
                      )
                  }
                >
                  Push
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
      },
    ],
    []
  );
}
