'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Clipboard } from 'lucide-react';
import { FunctionExecutionModel } from '@/lib/models/functions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

export const useColumns = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMemo<ColumnDef<FunctionExecutionModel>[]>(
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
        accessorKey: 'duration',
        header: 'Duration',
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
        accessorKey: 'success',
        header: 'Success',
      },
      {
        id: 'logs',
        cell: cell => {
          return cell.getValue() as string;
        },
      },
      {
        id: 'errors',
        cell: cell => {
          return cell.getValue() as string;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <Button
              size="sm"
              type="button"
              onClick={() => {
                console.log('re-run');
              }}
            >
              Re-run
            </Button>
          );
        },
      },
    ],
    []
  );
};
