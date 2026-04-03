'use client';
import { ColumnDef } from '@tanstack/react-table';
import { TeamUser } from '@/lib/models/User';
import { Clipboard, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeTeamMembers } from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';
import { EditTeamMemberRoleDialog } from '@/components/authentication/teams/manageTeam/members/edit-team-member-role-dialog';

export function getTeamMemberColumns({
  teamId,
  onChanged,
}: {
  teamId: string;
  onChanged: () => void;
}): ColumnDef<TeamUser>[] {
  return [
    {
      accessorKey: '_id',
      header: 'User ID',
      cell: cell => {
        return (
          <div className={'flex flex-row group'}>
            {cell.getValue() as string}
            <Clipboard
              className={
                'w-4 h-4 ml-2 invisible group-hover:visible cursor-pointer '
              }
              onClick={() => {
                void navigator.clipboard.writeText(cell.getValue() as string);
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className={'flex flex-row'}>
            <EditTeamMemberRoleDialog
              teamId={teamId}
              user={user}
              onChanged={onChanged}
            />
            <Button
              variant={'ghost'}
              size={'sm'}
              className={'text-destructive'}
              title="Remove from team"
              onClick={async () => {
                if (
                  !window.confirm(
                    `Remove ${user.email ?? user._id} from this team?`
                  )
                ) {
                  return;
                }
                try {
                  await removeTeamMembers(teamId, [user._id]);
                  toast({ title: 'Member removed' });
                  onChanged();
                } catch (e: unknown) {
                  const err = e as { message?: string };
                  toast({
                    title: 'Failed to remove member',
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
