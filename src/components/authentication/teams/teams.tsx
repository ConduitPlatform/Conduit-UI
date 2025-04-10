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
import { useSearchParams } from 'next/navigation';
import { DataTable } from '../components/data-table';
import EmptyTeams from '@/components/authentication/teams/TeamsTable/emptyTeams';
import { getTeams } from '@/lib/api/authentication';

export default function TeamsTable({
  data,
  parentTeamId,
  count: initialCount,
}: Readonly<{
  data: Team[];
  count: number;
  parentTeamId?: string;
}>) {
  const searchParams = useSearchParams();
  const [teams, setTeams] = useState<Team[]>(data);
  const [count, setCount] = useState<number>(initialCount);
  useEffect(() => {
    setTeams(data);
    setCount(initialCount);
  }, [data, initialCount]);
  const [search, setSearch] = useState<string>(
    searchParams.get('search') ?? ''
  );

  const { openTeamAdd, openSubTeamAdd } = useTeamActions();
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
    getTeams(skip, limit, {
      parentTeam: params.get('parentTeam') ?? '',
      sort: params.get('sort') ?? '',
      search,
    }).then(data => {
      setTeams(data.teams);
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
        <AddTeamSheet
          onSuccess={(team: Team) => {
            setTeams([...teams, team]);
          }}
          parent={parentTeamId}
        >
          <Button variant="outline">Add Team</Button>
        </AddTeamSheet>
      </div>
      <DataTable columns={columns} data={teams} count={count}>
        <EmptyTeams
          teamAdd={() => {
            if (parentTeamId) {
              openSubTeamAdd(parentTeamId);
            } else {
              openTeamAdd();
            }
          }}
        />
      </DataTable>
    </>
  );
}
