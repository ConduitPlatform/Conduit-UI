'use client';
import { columns } from '@/components/authentication/teams/TeamsTable/columns';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// @ts-ignore
import { useDebounce } from '@uidotdev/usehooks';
import { Team } from '@/lib/models/Team';
import { useTeamActions } from '@/components/authentication/teams/TeamActionsProvider';
import { AddTeamSheet } from '@/components/authentication/teams/addTeamSheet/addTeamSheet';
import { TeamDataTable } from '@/components/authentication/teams/TeamsTable/data-table';
import { useSearchParams } from 'next/navigation';

export default function TeamsTable({ data, refreshData, parentTeamId }: {
  data: Team[],
  refreshData: (searchString: string) => Promise<Team[]>
  parentTeamId?: string
}) {
  const searchParams = useSearchParams();
  const [teams, setTeams] = useState<Team[]>(data);
  const [search, setSearch] = useState<string>(searchParams.get('search') ?? '');

  const { openTeamAdd, openSubTeamAdd } = useTeamActions();
  const debouncedSearchTerm = useDebounce(search, 300);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', search);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    if (debouncedSearchTerm === '') {
      setTeams(data);
      return;
    }
    refreshData(debouncedSearchTerm).then((teams) => setTeams(teams));
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <Input placeholder={'Search'} className={'w-44'} onChange={(e) => setSearch(e.target.value)} />
        <AddTeamSheet onSuccess={(team: Team) => {
          setTeams([...teams, team]);
        }} parent={parentTeamId}>
          <Button variant='outline'>Add Team</Button>
        </AddTeamSheet>
      </div>
      <TeamDataTable columns={columns} data={teams} teamAdd={() => {
        if (parentTeamId) {
          openSubTeamAdd(parentTeamId);
        } else {
          openTeamAdd();
        }

      }} />
    </>
  );
}
