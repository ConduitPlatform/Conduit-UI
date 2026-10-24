'use client';
import type { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TeamUser } from '@/lib/models/User';
import { Clipboard, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeTeamMembers } from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';
import { useAlerts } from '@/components/providers/AlertProvider';
import { EditTeamMemberRoleDialog } from '@/components/authentication/teams/manageTeam/members/edit-team-member-role-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HOME_USER_REMOVAL_TOOLTIP,
  isRemovalBlocked,
} from '@/lib/authentication/realmMembers';

/** Explains a disabled remove button. A disabled button swallows pointer events, so a span hosts the tooltip. */
function RemovalBlockedTooltip({
  blocked,
  children,
}: Readonly<{ blocked: boolean; children: ReactNode }>) {
  if (!blocked) return <>{children}</>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className={'inline-flex'}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>{HOME_USER_REMOVAL_TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RemoveMemberButton({
  teamId,
  user,
  blocked,
  onChanged,
}: Readonly<{
  teamId: string;
  user: TeamUser;
  blocked: boolean;
  onChanged: () => void;
}>) {
  const { addAlert } = useAlerts();
  const remove = async () => {
    const result = await removeTeamMembers(teamId, [user._id]);
    if (!result.ok) {
      toast({
        title: 'Failed to remove member',
        description: result.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Member removed' });
    onChanged();
  };
  return (
    <RemovalBlockedTooltip blocked={blocked}>
      <Button
        variant={'ghost'}
        size={'sm'}
        className={'text-destructive'}
        aria-label="Remove from team"
        disabled={blocked}
        onClick={() =>
          addAlert({
            title: 'Remove member',
            description: `Remove ${user.email ?? user._id} from this team?`,
            cancelText: 'Cancel',
            actionText: 'Remove',
            onDecision: cancel => {
              if (!cancel) void remove();
            },
          })
        }
      >
        <Trash className={'w-4 h-4'} />
      </Button>
    </RemovalBlockedTooltip>
  );
}

const typeColumn: ColumnDef<TeamUser> = {
  id: 'membershipType',
  header: 'Type',
  cell: ({ row }) => {
    const type = row.original.membershipType;
    if (type === 'home') return <Badge variant="secondary">Home</Badge>;
    if (type === 'guest') return <Badge variant="outline">Guest</Badge>;
    return <span className="text-muted-foreground">—</span>;
  },
};

export function getTeamMemberColumns({
  teamId,
  onChanged,
  inRealm = false,
  isRealmTeam = false,
}: {
  teamId: string;
  onChanged: () => void;
  /** The team is a realm or sits inside one: shows the membership Type column. */
  inRealm?: boolean;
  /** The team is the realm team itself: home users cannot be removed from it. */
  isRealmTeam?: boolean;
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
    ...(inRealm ? [typeColumn] : []),
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        const removalBlocked = isRemovalBlocked(
          user.membershipType,
          isRealmTeam
        );

        return (
          <div className={'flex flex-row'}>
            <EditTeamMemberRoleDialog
              teamId={teamId}
              user={user}
              onChanged={onChanged}
            />
            <RemoveMemberButton
              teamId={teamId}
              user={user}
              blocked={removalBlocked}
              onChanged={onChanged}
            />
          </div>
        );
      },
    },
  ];
}
