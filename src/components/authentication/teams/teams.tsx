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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import EmptyTeams from '@/components/authentication/teams/TeamsTable/emptyTeams';
import { getTeams } from '@/lib/api/authentication';

const REALM_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'realms', label: 'Realms' },
] as const;

export default function TeamsTable({
  data,
  parentTeamId,
  count: initialCount,
  realmsEnabled = false,
}: Readonly<{
  data: Team[];
  count: number;
  parentTeamId?: string;
  /** Shows the All / Realms filter. Only the top-level list passes this. */
  realmsEnabled?: boolean;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const realmFilter = realmsEnabled && searchParams.get('realm') === 'true';
  const setRealmFilter = (onlyRealms: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (onlyRealms) params.set('realm', 'true');
    else params.delete('realm');
    params.delete('skip');
    router.replace(`${pathname}?${params.toString()}`);
  };
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
      ...(realmFilter ? { realm: true } : {}),
    }).then(data => {
      setTeams(data.teams);
      setCount(data.count);
    });
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className={'flex flex-row justify-between pb-2'}>
        <div className={'flex flex-row items-center gap-3'}>
          <Input
            placeholder={'Search'}
            className={'w-44'}
            onChange={e => setSearch(e.target.value)}
          />
          {realmsEnabled && (
            <div
              role="group"
              aria-label="Filter teams"
              className={'flex flex-row gap-1'}
            >
              {REALM_FILTERS.map(filter => {
                const active = (filter.value === 'realms') === realmFilter;
                return (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={active ? 'secondary' : 'ghost'}
                    aria-pressed={active}
                    onClick={() => setRealmFilter(filter.value === 'realms')}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
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
