import { getTeams } from '@/lib/api/authentication';
import { TeamActionsProvider } from '@/components/authentication/teams/TeamActionsProvider';
import TeamsTable from '@/components/authentication/teams/teams';

export default async function Teams(props: {
  searchParams: Promise<{
    skip: number;
    limit: number;
    sort?: string;
    search?: string;
    parentTeam?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
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

  return (
    <TeamActionsProvider>
      <TeamsTable data={data.teams} count={data.count} />
    </TeamActionsProvider>
  );
}
