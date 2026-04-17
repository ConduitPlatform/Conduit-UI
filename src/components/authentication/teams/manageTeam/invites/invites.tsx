'use client';
import { TeamInvite } from '@/lib/models/TeamInvite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { getInviteColumns } from '@/components/authentication/teams/manageTeam/invites/columns';
import { getTeamInvites } from '@/lib/api/authentication';
import { DataTable } from '@/components/ui/data-table';
import EmptyInvites from '@/components/authentication/teams/manageTeam/invites/emptyInvites';
import { toast } from '@/lib/hooks/use-toast';
import { CreateInviteSheet } from '@/components/authentication/teams/manageTeam/invites/CreateInviteSheet';
import { PlusIcon } from 'lucide-react';

export default function InvitesTable({
  data,
  teamId,
  count: initialCount,
}: Readonly<{
  data: TeamInvite[];
  count: number;
  teamId: string;
}>) {
  const searchParams = useSearchParams();
  const [count, setCount] = useState<number>(initialCount);
  const [invites, setInvites] = useState<TeamInvite[]>(data);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setInvites(data);
    setCount(initialCount);
  }, [data, initialCount]);

  const refreshInvites = useCallback(() => {
    const skip = parseInt(searchParams.get('skip') ?? '0');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    void getTeamInvites(teamId, skip, limit)
      .then(data => {
        setInvites(data.invites);
        setCount(data.count);
      })
      .catch((e: unknown) => {
        console.error('Failed to refresh invites', e);
        toast({
          title: 'Failed to load invites',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        });
      });
  }, [teamId, searchParams]);

  const columns = useMemo(
    () =>
      getInviteColumns({
        teamId,
        onChanged: refreshInvites,
      }),
    [teamId, refreshInvites]
  );

  return (
    <>
      <div className={'flex flex-row justify-end pb-2'}>
        <CreateInviteSheet
          teamId={teamId}
          defaultOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSuccess={refreshInvites}
        >
          <Button variant="outline" type={'button'}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Create Invite
          </Button>
        </CreateInviteSheet>
      </div>
      <DataTable columns={columns} data={invites} count={count}>
        <EmptyInvites onCreate={() => setSheetOpen(true)} />
      </DataTable>
    </>
  );
}
