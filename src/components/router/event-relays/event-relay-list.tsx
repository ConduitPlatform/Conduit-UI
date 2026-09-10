'use client';

import { useCallback, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Plus, Radio, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/form-inputs/SearchInput';
import { DeleteAlert } from '@/components/helpers/delete';
import { EventRelayDocs } from '@/components/router/event-relays/event-relay-docs';
import { EventRelayForm } from '@/components/router/event-relays/event-relay-form';
import { EventRelay, EventRelayWriteRequest } from '@/lib/models/Router';
import {
  createEventRelay,
  deleteEventRelay,
  patchEventRelay,
} from '@/lib/api/router';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { useRouter } from 'next/navigation';

interface EventRelayListProps {
  relays: EventRelay[];
  count: number;
  socketsEnabled: boolean;
}

export function EventRelayList({
  relays,
  count,
  socketsEnabled,
}: EventRelayListProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EventRelay | null>(null);
  const [docsOpen, setDocsOpen] = useState(count === 0);
  const { save, isSaving } = useSettingsSave('Event Relay');

  const toggleDocs = useCallback(() => {
    setDocsOpen(open => {
      const next = !open;
      if (next) {
        requestAnimationFrame(() => {
          document
            .getElementById('event-relay-docs')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleCreate = async (data: EventRelayWriteRequest) => {
    const result = await save({
      action: async () => {
        await createEventRelay(data);
        await refresh();
      },
      successMessage: 'Event relay created',
    });
    if (result.ok) {
      setIsCreateOpen(false);
    }
  };

  const handleUpdate = async (data: EventRelayWriteRequest) => {
    if (!editing) return;
    const result = await save({
      action: async () => {
        await patchEventRelay(editing._id, data);
        await refresh();
      },
      successMessage: 'Event relay updated',
    });
    if (result.ok) {
      setEditing(null);
    }
  };

  const columns = useMemo<ColumnDef<EventRelay>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            {row.original.notes ? (
              <p className="text-xs text-muted-foreground">
                {row.original.notes}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'busEvent',
        header: 'Bus event',
        cell: ({ row }) => (
          <code className="font-mono text-xs slashed-zero">
            {row.original.busEvent}
          </code>
        ),
      },
      {
        accessorKey: 'socketEvent',
        header: 'Socket event',
        cell: ({ row }) => (
          <code className="font-mono text-xs slashed-zero">
            {row.original.socketEvent}
          </code>
        ),
      },
      {
        accessorKey: 'resourceType',
        header: 'Resource',
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.resourceType}:{row.original.permission}
          </span>
        ),
      },
      {
        accessorKey: 'active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.active ? 'default' : 'outline'}>
            {row.original.active ? 'Active' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(row.original)}
            >
              Edit
            </Button>
            <DeleteAlert
              title="Delete event relay"
              description="Clients subscribed to this relay will stop receiving messages. This cannot be undone."
              callback={() =>
                save({
                  action: async () => {
                    await deleteEventRelay(row.original._id);
                    await refresh();
                  },
                  successMessage: 'Event relay deleted',
                })
              }
            />
          </div>
        ),
      },
    ],
    [save, refresh]
  );

  return (
    <div className="space-y-6">
      <PageHeader className="flex-wrap">
        <div>
          <PageTitle>Event Relays</PageTitle>
          <PageDescription>
            Send a templated socket message when an exact bus event arrives.
            Subscribers join resource rooms on /events/ after a ReBAC check.
          </PageDescription>
        </div>
        <PageActions>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleDocs}
                  aria-expanded={docsOpen}
                  aria-controls="event-relay-docs"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  How it works
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {docsOpen
                  ? 'Hide how Event Relays work'
                  : 'Show how Event Relays work'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New relay
          </Button>
        </PageActions>
      </PageHeader>

      {!socketsEnabled ? (
        <Alert variant="warning">
          <Zap className="h-4 w-4" />
          <AlertTitle>WebSockets are disabled</AlertTitle>
          <AlertDescription>
            Enable sockets in Router Settings before clients can subscribe to
            relays.
          </AlertDescription>
        </Alert>
      ) : null}

      <EventRelayDocs open={docsOpen} onOpenChange={setDocsOpen} />

      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search relays" className="w-56" />
      </div>

      {relays.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No event relays"
          description="Read how relays work above, then create one."
          action={
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New relay
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={relays} count={count} />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create event relay</DialogTitle>
            <DialogDescription>
              Match one bus channel and emit a JSON template to the related
              resource room.
            </DialogDescription>
          </DialogHeader>
          <EventRelayForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={open => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit event relay</DialogTitle>
            <DialogDescription>
              Changes apply immediately to new bus events. Delivery is ephemeral
              and is not replayed.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <EventRelayForm
              relay={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              isSaving={isSaving}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
