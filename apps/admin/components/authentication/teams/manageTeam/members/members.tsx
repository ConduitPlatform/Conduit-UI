'use client';
import { TeamUser } from '@/lib/models/User';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { MemberDataTable } from '@/components/authentication/teams/manageTeam/members/data-table';
import { columns } from '@/components/authentication/teams/manageTeam/members/columns';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import { addTeamMembers } from '@/lib/api/authentication';

export default function MembersTable({ data, teamId, count, refreshData }: {
  data: TeamUser[], count: number, teamId: string,
  refreshData: (searchString: string) => Promise<TeamUser[]>
}) {
  const searchParams = useSearchParams();
  const { openPicker } = useUserPicker();

  const [users, setUsers] = useState<TeamUser[]>(data);
  const [search, setSearch] = useState<string>(searchParams.get('search') ?? '');
  const debouncedSearchTerm = useDebounce(search, 300);
  const pickUser = useCallback(() => {
    openPicker((pickedUsers) => {
      addTeamMembers(teamId, pickedUsers).then(() => {
        setUsers([...users, ...pickedUsers.map((user) => ({ ...user, role: 'member' }))]);
      });
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    if (debouncedSearchTerm === '') {
      setUsers(data);
      return;
    }
    refreshData(debouncedSearchTerm).then((users) => setUsers(users));
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input placeholder={'Search'} className={'w-44'} onChange={(e) => setSearch(e.target.value)} />
        <Button variant='outline' type={'button'} onClick={pickUser}>Add Member</Button>
      </div>
      <MemberDataTable columns={columns} data={users} memberAdd={pickUser} />
    </>
  );
}
