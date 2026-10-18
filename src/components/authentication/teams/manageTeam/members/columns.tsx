'use client';
import type { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TeamUser } from '@/lib/models/User';
import { Clipboard, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeTeamMembers } from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';
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
            <RemovalBlockedTooltip blocked={removalBlocked}>
              <Button
                variant={'ghost'}
                size={'sm'}
                className={'text-destructive'}
                title="Remove from team"
                disabled={removalBlocked}
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
            </RemovalBlockedTooltip>
          </div>
        );
      },
    },
  ];
}
