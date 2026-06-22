'use client';

import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment/moment';
import { DeleteAlert } from '@/components/helpers/delete';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { deleteCommunicationTemplate } from '@/lib/api/communications/templates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TemplateRow,
  getTemplateRowCreatedAt,
  getTemplateRowName,
  getTemplateRowVariablesCount,
} from '@/lib/models/communications/template-row';
import { ExternalTemplate } from '@/lib/models/email';
import { EmailTemplatePreview } from './email-template-preview';

type TemplateRowColumnsOptions = {
  onAddChannels: (emailTemplateId: string) => void;
};

function ExternalTemplateViewDialog({
  template,
  open,
  onOpenChange,
}: {
  template: ExternalTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        <EmailTemplatePreview
          template={{
            name: template.name,
            subject: template.subject,
            body: template.body,
            variables: template.variables,
            isExternal: true,
          }}
          readOnlyDetails
        />
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ row }: { row: TemplateRow }) {
  switch (row.kind) {
    case 'email':
      return null;
    case 'unified':
      if (row.template.channels.length > 1) {
        return <Badge variant="secondary">Unified</Badge>;
      }
      return null;
    case 'external':
      return <Badge variant="secondary">External</Badge>;
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
}

function ChannelsCell({ row }: { row: TemplateRow }) {
  switch (row.kind) {
    case 'unified':
      return (
        <div className="flex flex-wrap gap-1">
          {row.template.channels.map(channel => (
            <Badge key={channel} variant="secondary" className="capitalize">
              {channel}
            </Badge>
          ))}
        </div>
      );
    case 'email':
    case 'external':
      return (
        <Badge variant="secondary" className="capitalize">
          email
        </Badge>
      );
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
}

function ActionsCell({
  row,
  onAddChannels,
}: {
  row: TemplateRow;
  onAddChannels: (emailTemplateId: string) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [externalViewOpen, setExternalViewOpen] = useState(false);

  switch (row.kind) {
    case 'unified':
      return (
        <div className="flex items-center justify-end gap-2">
          <DeleteAlert
            title="Delete template"
            description={`Delete template "${row.template.name}"?`}
            callback={() =>
              deleteCommunicationTemplate(row.template._id)
                .then(() => router.refresh())
                .catch(err =>
                  toast({ title: 'Communications', description: err.message })
                )
            }
          />
          <Link
            href={`/communications/templates/${row.template._id}`}
            aria-label={`View ${row.template.name}`}
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
        </div>
      );
    case 'email':
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onAddChannels(row.template._id)}
          >
            Add channels
          </Button>
          <Link
            href={`/communications/templates/email/${row.template._id}`}
            aria-label={`View ${row.template.name}`}
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
        </div>
      );
    case 'external':
      return (
        <div className="flex justify-end">
          <ExternalTemplateViewDialog
            template={row.template}
            open={externalViewOpen}
            onOpenChange={setExternalViewOpen}
          />
          <button
            type="button"
            onClick={() => setExternalViewOpen(true)}
            aria-label={`View ${row.template.name}`}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      );
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
}

export function useTemplateRowColumns({
  onAddChannels,
}: TemplateRowColumnsOptions) {
  return useMemo<ColumnDef<TemplateRow, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessorFn: row => getTemplateRowName(row),
        cell: ({ row }) => {
          const name = getTemplateRowName(row.original);
          if (row.original.kind === 'unified') {
            return (
              <Link
                href={`/communications/templates/${row.original.template._id}`}
                className="font-medium underline-offset-3 hover:underline"
              >
                {name}
              </Link>
            );
          }
          if (row.original.kind === 'email') {
            return (
              <Link
                href={`/communications/templates/email/${row.original.template._id}`}
                className="font-medium underline-offset-3 hover:underline"
              >
                {name}
              </Link>
            );
          }
          return <span>{name}</span>;
        },
      },
      {
        id: 'channels',
        header: 'Channels',
        cell: ({ row }) => <ChannelsCell row={row.original} />,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge row={row.original} />,
      },
      {
        id: 'variables',
        header: 'Variables',
        accessorFn: row => getTemplateRowVariablesCount(row),
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessorFn: row => getTemplateRowCreatedAt(row),
        cell: props => moment(props.getValue() as string).format('DD MMM YYYY'),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ActionsCell row={row.original} onAddChannels={onAddChannels} />
        ),
      },
    ],
    [onAddChannels]
  );
}
