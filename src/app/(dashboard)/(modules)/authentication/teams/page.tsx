import { getAuthenticationSettings, getTeams } from '@/lib/api/authentication';
import { TeamActionsProvider } from '@/components/authentication/teams/TeamActionsProvider';
import TeamsTable from '@/components/authentication/teams/teams';
import { realmsEnabled } from '@/lib/authentication/realms';

export default async function Teams(props: {
  searchParams: Promise<{
    skip: number;
    limit: number;
    sort?: string;
    search?: string;
    parentTeam?: string;
    realm?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { skip, limit, realm, ...queryParams } = searchParams;

  // Older backends (or a failed read) simply render today's page.
  const settings = await getAuthenticationSettings().catch(() => null);
  const showRealms = realmsEnabled(settings?.config);

  const data = await getTeams(skip ?? 0, limit ?? 20, {
    ...queryParams,
    ...(showRealms && realm === 'true' ? { realm: true } : {}),
  }).catch(() => null);
  if (!data)
    return (
      <div>
        Teams feature inactive go to Authentication Settings to activate
      </div>
    );

  return (
    <TeamActionsProvider>
      <TeamsTable
        data={data.teams}
        count={data.count}
        realmsEnabled={showRealms}
      />
    </TeamActionsProvider>
  );
}
