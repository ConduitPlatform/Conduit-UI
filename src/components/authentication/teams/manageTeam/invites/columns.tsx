'use client';
import { ColumnDef } from '@tanstack/react-table';
import { TeamInvite } from '@/lib/models/TeamInvite';
import { Clipboard, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deletePersistentInvite } from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';

export function getInviteColumns({
  teamId,
  onChanged,
}: {
  teamId: string;
  onChanged: () => void;
}): ColumnDef<TeamInvite>[] {
  return [
    {
      accessorKey: 'token',
      header: 'Token',
      cell: cell => {
        const token = cell.getValue() as string;
        return (
          <div className={'flex flex-row group items-center'}>
            <span className="font-mono text-xs">
              {token.slice(0, 8)}...{token.slice(-4)}
            </span>
            <Clipboard
              className={
                'w-4 h-4 ml-2 invisible group-hover:visible cursor-pointer'
              }
              onClick={() => {
                void navigator.clipboard.writeText(token);
                toast({ title: 'Token copied to clipboard' });
              }}
            />
          </div>
        );
      },
    },
    {
      id: 'role',
      header: 'Role',
      accessorFn: row => row.data?.role ?? 'member',
    },
    {
      id: 'type',
      header: 'Type',
      accessorFn: row => (row.data?.email ? 'Email-bound' : 'Persistent'),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: cell => {
        const date = new Date(cell.getValue() as string);
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invite = row.original;
        return (
          <div className={'flex flex-row items-center gap-1'}>
            <Button
              variant={'ghost'}
              size={'sm'}
              title="Delete invite"
              className={'text-destructive'}
              onClick={async () => {
                if (
                  !window.confirm(
                    'Delete this invite token? Users with this link will no longer be able to join.'
                  )
                ) {
                  return;
                }
                try {
                  await deletePersistentInvite(teamId, invite.token);
                  toast({ title: 'Invite deleted' });
                  onChanged();
                } catch (e: unknown) {
                  const err = e as { message?: string };
                  toast({
                    title: 'Failed to delete invite',
                    description: err.message,
                    variant: 'destructive',
                  });
                }
              }}
            >
              <Trash className={'w-4 h-4'} />
            </Button>
          </div>
        );
      },
    },
  ];
}
