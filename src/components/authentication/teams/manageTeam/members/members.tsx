'use client';
import { TeamUser } from '@/lib/models/User';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { getTeamMemberColumns } from '@/components/authentication/teams/manageTeam/members/columns';
import { getTeamMembers } from '@/lib/api/authentication';
import { AddMemberSheet } from '@/components/authentication/teams/manageTeam/members/addMemberSheet/addMemberSheet';
import { DataTable } from '@/components/ui/data-table';
import EmptyTeamMembers from '@/components/authentication/teams/manageTeam/members/emptyTeamMembers';
import { toast } from '@/lib/hooks/use-toast';
import type { GuestPolicy } from '@/lib/authentication/realmMembers';

export default function MembersTable({
  data,
  teamId,
  count: initialCount,
  inRealm = false,
  isRealmTeam = false,
  realmTeamId,
  guestPolicy,
}: Readonly<{
  data: TeamUser[];
  count: number;
  teamId: string;
  /** The team is a realm or sits inside one: shows the membership Type column. */
  inRealm?: boolean;
  /** The team is the realm itself: its home users cannot be removed. */
  isRealmTeam?: boolean;
  /** The realm the team belongs to (the team itself or its top-most ancestor). */
  realmTeamId?: string;
  /** The realm's `policies.guests`, used to filter who the picker offers. */
  guestPolicy?: GuestPolicy;
}>) {
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);

  const [count, setCount] = useState<number>(initialCount);
  const [users, setUsers] = useState<TeamUser[]>(data);
  const [search, setSearch] = useState<string>(
    searchParams.get('search') ?? ''
  );
  useEffect(() => {
    setUsers(data);
    setCount(initialCount);
  }, [data, initialCount]);
  const pickUser = useCallback(() => setAddOpen(true), []);

  const debouncedSearchTerm = useDebounce(search, 300);

  const refreshMembers = useCallback(() => {
    const skip = parseInt(searchParams.get('skip') ?? '0');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    void getTeamMembers(teamId, skip, limit, {
      sort: searchParams.get('sort') || undefined,
      search: search || undefined,
    })
      .then(data => {
        setUsers(data.members);
        setCount(data.count);
      })
      .catch((e: unknown) => {
        console.error('Failed to refresh team members', e);
        toast({
          title: 'Failed to load team members',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        });
      });
  }, [teamId, searchParams, search]);

  const columns = useMemo(
    () =>
      getTeamMemberColumns({
        teamId,
        onChanged: refreshMembers,
        inRealm,
        isRealmTeam,
      }),
    [teamId, refreshMembers, inRealm, isRealmTeam]
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    const skip = parseInt(searchParams.get('skip') ?? '0');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    getTeamMembers(teamId, skip, limit, {
      sort: params.get('sort') || undefined,
      search: search || undefined,
    })
      .then(data => {
        setUsers(data.members);
        setCount(data.count);
      })
      .catch((e: unknown) => {
        console.error('Failed to refresh team members', e);
        toast({
          title: 'Failed to load team members',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        });
      });
    // Intentionally only depend on debouncedSearchTerm: including searchParams causes
    // an infinite loop with window.history.pushState when switching Members/Teams tabs.
    // teamId/search/searchParams read from latest closure when debounce fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL + fetch only on debounced search
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input
          placeholder={'Search'}
          className={'w-44'}
          onChange={e => setSearch(e.target.value)}
        />
        <Button variant="outline" type={'button'} onClick={pickUser}>
          Add Member
        </Button>
      </div>
      <DataTable columns={columns} data={users} count={count}>
        <EmptyTeamMembers memberAdd={pickUser} />
      </DataTable>
      <AddMemberSheet
        teamId={teamId}
        realmTeamId={realmTeamId}
        guestPolicy={guestPolicy}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={refreshMembers}
        existingMemberIds={users.map(user => user._id)}
      />
    </>
  );
}
