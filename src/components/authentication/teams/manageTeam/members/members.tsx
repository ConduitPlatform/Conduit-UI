'use client';
import { TeamUser } from '@/lib/models/User';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { columns } from '@/components/authentication/teams/manageTeam/members/columns';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import { addTeamMembers, getTeamMembers } from '@/lib/api/authentication';
import { DataTable } from '@/components/authentication/components/data-table';
import EmptyTeamMembers from '@/components/authentication/teams/manageTeam/members/emptyTeamMembers';

export default function MembersTable({
  data,
  teamId,
  count: initialCount,
}: Readonly<{
  data: TeamUser[];
  count: number;
  teamId: string;
}>) {
  const searchParams = useSearchParams();
  const { openPicker } = useUserPicker();

  const [count, setCount] = useState<number>(initialCount);
  const [users, setUsers] = useState<TeamUser[]>(data);
  const [search, setSearch] = useState<string>(
    searchParams.get('search') ?? ''
  );
  useEffect(() => {
    setUsers(data);
    setCount(initialCount);
  }, [data, initialCount]);
  const pickUser = useCallback(() => {
    openPicker(pickedUsers => {
      addTeamMembers(teamId, pickedUsers).then(() => {
        setUsers([
          ...users,
          ...pickedUsers.map(user => ({ ...user, role: 'member' })),
        ]);
      });
    });
  }, []);

  const debouncedSearchTerm = useDebounce(search, 300);
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
      sort: params.get('sort') ?? '',
      search,
    }).then(data => {
      setUsers(data.members);
      setCount(data.count);
    });
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
    </>
  );
}
