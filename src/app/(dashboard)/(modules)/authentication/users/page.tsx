import {
  getAuthenticationSettings,
  getRealms,
  getUsers,
} from '@/lib/api/authentication';
import UsersTable from '@/components/authentication/users/users';
import { UserActionsProvider } from '@/components/authentication/users/UserActionsProvider';
import { realmsEnabled } from '@/lib/authentication/realms';
import { buildRealmSlugMap } from '@/lib/authentication/realmMembers';

const MAX_REALMS = 100;

export default async function UserPage(
  props: Readonly<{
    searchParams: Promise<{
      skip: number;
      limit: number;
      sort?: string;
      search?: string;
      isActive?: boolean;
      provider?: string;
      homeRealm?: string;
    }>;
  }>
) {
  const { homeRealm, ...searchParams } = await props.searchParams;

  // Older backends (or a failed read) simply render today's page.
  const settings = await getAuthenticationSettings().catch(() => null);
  const showRealms = realmsEnabled(settings?.config);
  // Slugs label the home realm ids that come back on users.
  const realmSlugs = buildRealmSlugMap(
    showRealms
      ? ((await getRealms(0, MAX_REALMS).catch(() => null))?.realms ?? [])
      : []
  );

  const data = await getUsers(
    searchParams.skip ?? 0,
    searchParams.limit ?? 10,
    {
      ...searchParams,
      ...(showRealms && homeRealm ? { homeRealm } : {}),
    }
  );

  return (
    <UserActionsProvider realmsEnabled={showRealms} realmSlugs={realmSlugs}>
      <UsersTable
        data={data.users}
        count={data.count}
        realmsEnabled={showRealms}
        realmSlugs={realmSlugs}
      />
    </UserActionsProvider>
  );
}
