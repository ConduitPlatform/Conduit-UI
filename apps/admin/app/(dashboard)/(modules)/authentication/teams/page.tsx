import { getTeams } from '@/lib/api/authentication';
import { TeamActionsProvider } from '@/components/authentication/teams/TeamActionsProvider';
import TeamsTable from '@/components/authentication/teams/teams';
import { Team } from '@/lib/models/Team';

export default async function Teams({
  searchParams,
}: {
  searchParams: {
    skip: number;
    limit: number;
    sort?: string;
    search?: string;
    parentTeam?: string;
  };
}) {
  const { skip, limit, ...queryParams } = searchParams;

  const data = await getTeams(skip ?? 0, limit ?? 20, queryParams).catch(
    () => null
  );
  if (!data)
    return (
      <div>
        Teams feature inactive go to Authentication Settings to activate
      </div>
    );
  const refreshTeams = async (search: string) => {
    'use server';
    const { teams, count } = await getTeams(skip ?? 0, limit ?? 20, {
      ...queryParams,
      search,
    });
    return teams;
  };

  return (
    <TeamActionsProvider>
      <TeamsTable data={data.teams} refreshData={refreshTeams} />
    </TeamActionsProvider>
  );
}
