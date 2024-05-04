'use client';
import { TeamUser } from '@/lib/models/User';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { MemberDataTable } from '@/components/authentication/teams/manageTeam/members/data-table';
import { useMemberActions } from '@/components/authentication/teams/manageTeam/members/MemberActionsProvider';
import { AddMemberSheet } from '@/components/authentication/teams/manageTeam/members/addMemberSheet/addMemberSheet';
import { columns } from '@/components/authentication/teams/manageTeam/members/columns';

export default function MembersTable({ data, count, refreshData }: {
  data: TeamUser[], count: number,
  refreshData: (searchString: string) => Promise<TeamUser[]>
}) {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<TeamUser[]>(data);
  const [search, setSearch] = useState<string>(searchParams.get('search') ?? '');
  const { openMemberAdd } = useMemberActions();
  const debouncedSearchTerm = useDebounce(search, 300);
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
        <AddMemberSheet onSuccess={(user: TeamUser) => {
          setUsers([...users, user]);
        }}>
          <Button variant='outline'>Add Member</Button>
        </AddMemberSheet>
      </div>
      <MemberDataTable columns={columns} data={users} memberAdd={openMemberAdd} />
    </>
  );
}
