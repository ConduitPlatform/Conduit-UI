'use client';

import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment/moment';
import { DeleteAlert } from '@/components/helpers/delete';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { CommunicationTemplate } from '@/lib/models/communications/templates';
import { deleteCommunicationTemplate } from '@/lib/api/communications/templates';
import { Badge } from '@/components/ui/badge';

export function useCommunicationTemplateColumns() {
  const router = useRouter();
  const { toast } = useToast();

  return useMemo<ColumnDef<CommunicationTemplate, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'channels',
        header: 'Channels',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.channels.map(channel => (
              <Badge key={channel} variant="secondary" className="capitalize">
                {channel}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'variables',
        header: 'Variables',
        cell: ({ row }) => row.original.variables?.length ?? 0,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: props => moment(props.getValue() as string).format('DD MMM YYYY'),
      },
      {
        id: 'delete',
        header: '',
        cell: props => (
          <DeleteAlert
            title="Delete template"
            description={`Delete unified template "${props.row.original.name}"?`}
            callback={() =>
              deleteCommunicationTemplate(props.row.original._id)
                .then(() => router.refresh())
                .catch(err =>
                  toast({ title: 'Communications', description: err.message })
                )
            }
          />
        ),
      },
      {
        id: 'view',
        header: '',
        cell: props => (
          <Link href={`/communications/templates/${props.row.original._id}`}>
            <EyeIcon className="h-4 w-4" />
          </Link>
        ),
      },
    ],
    [router, toast]
  );
}
