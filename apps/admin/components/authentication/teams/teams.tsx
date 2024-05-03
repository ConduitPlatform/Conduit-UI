'use client';
import { columns } from '@/components/authentication/teams/TeamsTable/columns';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { getTeams } from '@/lib/api/authentication';
import { Team } from '@/lib/models/Team';
import { useTeamActions } from '@/components/authentication/teams/TeamActionsProvider';
import { AddTeamSheet } from '@/components/authentication/teams/addTeamSheet/addTeamSheet';
import { TeamDataTable } from '@/components/authentication/teams/TeamsTable/data-table';

export default function TeamsTable({ data }: { data: Team[]}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState<string>('');
  const { openTeamAdd } = useTeamActions();
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    setTeams(data);
  }, [data]);
  useEffect(() => {
    if (debouncedSearchTerm === '') {
      setTeams(data);
      return;
    }
    getTeams(0, 10, { search: debouncedSearchTerm })
      .then((res) => {
        setTeams(res.teams);
      });
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input placeholder={'Search'} className={'w-44'} onChange={(e) => setSearch(e.target.value)} />
        <AddTeamSheet onSuccess={(team: Team) => {
          setTeams([...teams, team]);
        }}>
          <Button variant='outline'>Add Team</Button>
        </AddTeamSheet>
      </div>
      <TeamDataTable columns={columns} data={teams} teamAdd={openTeamAdd} />
    </>
  );
}
