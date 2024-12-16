'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Clipboard, EditIcon, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { FunctionModel } from '@/lib/models/functions';
import { DeleteAlert } from '@/components/helpers/delete';
import { deleteFunction } from '@/lib/api/functions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import { useMemo } from 'react';

export const useColumns = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMemo<ColumnDef<FunctionModel>[]>(
    () => [
      {
        accessorKey: '_id',
        header: 'ID',
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
        accessorKey: 'name',
        header: 'Name',
        cell: cell => {
          return (
            <div className={'flex flex-row group'}>
              <span className={'truncate w-32'}>
                {cell.getValue() as string}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'functionType',
        header: 'Type',
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <div className={'flex flex-row items-center space-x-3'}>
              <Link href={`/functions/edit?function=${row.original._id}`}>
                <EditIcon className={'w-4 h-4'} />
              </Link>
              <Link href={`/functions/test?function=${row.original._id}`}>
                <SendIcon className={'w-4 h-4'} />
              </Link>
              <DeleteAlert
                title={'Delete Function'}
                description={'Are you sure you want to delete this function?'}
                callback={() =>
                  deleteFunction(row.original._id)
                    .then(() => {
                      toast({
                        title: 'Functions',
                        description: 'Function deleted successfully',
                      });
                      router.refresh();
                    })
                    .catch(err =>
                      toast({
                        title: 'Functions',
                        description: err.message,
                      })
                    )
                }
              />
            </div>
          );
        },
      },
    ],
    []
  );
};
