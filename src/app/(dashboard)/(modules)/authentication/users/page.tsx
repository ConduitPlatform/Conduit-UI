import {
  getAuthenticationSettings,
  getRealms,
  getUserAdminCapabilities,
  getUsers,
} from '@/lib/api/authentication';
import UsersTable from '@/components/authentication/users/users';
import { UserActionsProvider } from '@/components/authentication/users/UserActionsProvider';
import { LEGACY_CAPABILITIES } from '@/lib/authentication/userCapabilities';
import {
  parseUserListParams,
  providerChoices,
  toUserQueryParams,
} from '@/lib/authentication/userListParams';
import { realmIdentityMode, realmsEnabled } from '@/lib/authentication/realms';
import {
  buildRealmSlugMap,
  MAX_REALMS_IN_FILTERS,
} from '@/lib/authentication/realmMembers';

export default async function UserPage(
  props: Readonly<{
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }>
) {
  const searchParams = await props.searchParams;

  // Older backends (or a failed read) simply render today's page.
  const [settings, capabilitiesResult] = await Promise.all([
    getAuthenticationSettings().catch(() => null),
    getUserAdminCapabilities().catch(() => null),
  ]);
  const capabilities =
    capabilitiesResult && capabilitiesResult.ok
      ? capabilitiesResult.data
      : LEGACY_CAPABILITIES;
  const showRealms = realmsEnabled(settings?.config);
  const identityMode = realmIdentityMode(settings?.config);
  const teamsEnabled = settings?.config.teams?.enabled === true;
  const query = parseUserListParams(searchParams, capabilities);
  // Slugs label the home realm ids that come back on users.
  const realmList = showRealms
    ? await getRealms(0, MAX_REALMS_IN_FILTERS).catch(() => null)
    : null;
  const realmSlugs = buildRealmSlugMap(realmList?.realms ?? []);
  const realmsTruncated = (realmList?.count ?? 0) > MAX_REALMS_IN_FILTERS;

  const data = await getUsers(
    query.skip,
    query.limit,
    toUserQueryParams(query, { includeHomeRealm: showRealms })
  );

  return (
    <UserActionsProvider
      realmsEnabled={showRealms}
      realmSlugs={realmSlugs}
      identityMode={identityMode}
      capabilities={capabilities}
      teamsEnabled={teamsEnabled}
      users={data.users}
    >
      <UsersTable
        data={data.users}
        count={data.count}
        realmsEnabled={showRealms}
        realmSlugs={realmSlugs}
        realmsTruncated={realmsTruncated}
        identityMode={identityMode}
        capabilities={capabilities}
        providers={providerChoices(settings?.config, capabilities)}
      />
    </UserActionsProvider>
  );
}
