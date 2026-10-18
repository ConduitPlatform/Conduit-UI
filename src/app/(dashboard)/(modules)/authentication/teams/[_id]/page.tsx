import {
  getAuthenticationSettings,
  getRealm,
  getTeam,
  getTeamInvites,
  getTeamMembers,
  getTeams,
} from '@/lib/api/authentication';
import { realmsEnabled } from '@/lib/authentication/realms';
import { Team } from '@/lib/models/Team';
import RealmTab from '@/components/authentication/teams/manageTeam/realm/RealmTab';
import { RealmInheritedBanner } from '@/components/authentication/teams/manageTeam/realm/RealmInheritedBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { MemberActionsProvider } from '@/components/authentication/teams/manageTeam/members/MemberActionsProvider';
import MembersTable from '@/components/authentication/teams/manageTeam/members/members';
import TeamProfile from '@/components/authentication/teams/manageTeam/teamProfile';
import { TeamActionsProvider } from '@/components/authentication/teams/TeamActionsProvider';
import TeamsTable from '@/components/authentication/teams/teams';
import InvitesTable from '@/components/authentication/teams/manageTeam/invites/invites';

export const dynamic = 'force-dynamic';

const MAX_ANCESTOR_DEPTH = 10;

/** Walks up from `team` and returns the top-most ancestor (or `team` itself). */
async function getTopAncestor(team: Team): Promise<Team> {
  let top = team;
  for (let depth = 0; top.parentTeam && depth < MAX_ANCESTOR_DEPTH; depth++) {
    try {
      top = await getTeam(top.parentTeam);
    } catch {
      break;
    }
  }
  return top;
}

export default async function Teams(
  props: Readonly<{
    searchParams: Promise<{
      skip: number;
      limit: number;
      mode?: string;
      sort?: string;
      search?: string;
      parentTeam?: string;
    }>;
    params: Promise<{
      _id: string;
    }>;
  }>
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { skip, limit, ...queryParams } = searchParams;
  const team = await getTeam(params._id);
  let parentTeam;
  if (team.parentTeam) {
    parentTeam = await getTeam(team.parentTeam);
  }

  // All realm UI is gated on the backend reporting realms as enabled; older backends
  // (or a failed settings read) get today's page.
  const settings = await getAuthenticationSettings().catch(() => null);
  const showRealms = realmsEnabled(settings?.config);
  const isTopLevel = !team.parentTeam;
  const showRealmTab = showRealms && isTopLevel;
  // Sub-teams inherit the identity and policies of the realm at the top of their tree.
  let realmAncestor: Team | undefined;
  if (showRealms && parentTeam) {
    const top = await getTopAncestor(parentTeam);
    if (top.realm?.enabled) realmAncestor = top;
  }

  const data = await getTeams(skip ?? 0, limit ?? 10, {
    ...queryParams,
    parentTeam: params._id,
  });
  const userData = await getTeamMembers(
    params._id,
    searchParams.skip ?? 0,
    searchParams.limit ?? 10,
    {
      sort: searchParams.sort || undefined,
      search: searchParams.search || undefined,
    }
  );

  let inviteData = {
    invites: [] as Awaited<ReturnType<typeof getTeamInvites>>['invites'],
    count: 0,
  };
  try {
    inviteData = await getTeamInvites(
      params._id,
      searchParams.skip ?? 0,
      searchParams.limit ?? 10
    );
  } catch {
    // Invites may not be available if teams.invites is disabled
  }

  const activeTab =
    searchParams.mode === 'subteams'
      ? 'subteams'
      : searchParams.mode === 'invites'
        ? 'invites'
        : searchParams.mode === 'realm' && showRealmTab
          ? 'realm'
          : 'members';

  // Loaded whenever the team is a realm (not only on ?mode=realm): the tabs switch
  // client-side before the navigation lands, and the tab must not flash an error.
  const realm =
    showRealmTab && team.realm?.enabled
      ? await getRealm(team._id).catch(() => null)
      : null;

  return (
    <div className={'flex flex-col w-full gap-y-2'}>
      <TeamProfile
        team={team}
        parentTeam={parentTeam}
        subTeamCount={data.count}
        memberCount={userData.count}
        realmsEnabled={showRealms}
      />
      {realmAncestor && <RealmInheritedBanner realmTeam={realmAncestor} />}
      <Tabs defaultValue={activeTab}>
        <TabsList
          className={
            showRealmTab
              ? 'grid grid-cols-4 w-[660px]'
              : 'grid grid-cols-3 w-[500px]'
          }
        >
          <TabsTrigger value="members" asChild>
            <Link href={`/authentication/teams/${params._id}?mode=members`}>
              Members
            </Link>
          </TabsTrigger>
          <TabsTrigger value="subteams" asChild>
            <Link href={`/authentication/teams/${params._id}?mode=subteams`}>
              Teams
            </Link>
          </TabsTrigger>
          <TabsTrigger value="invites" asChild>
            <Link href={`/authentication/teams/${params._id}?mode=invites`}>
              Invites
            </Link>
          </TabsTrigger>
          {showRealmTab && (
            <TabsTrigger value="realm" asChild>
              <Link href={`/authentication/teams/${params._id}?mode=realm`}>
                Realm
              </Link>
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="members">
          <MemberActionsProvider>
            <MembersTable
              data={userData.members}
              count={userData.count}
              teamId={team._id}
            />
          </MemberActionsProvider>
        </TabsContent>
        <TabsContent value="subteams">
          <TeamActionsProvider>
            <TeamsTable
              data={data.teams}
              parentTeamId={team._id}
              count={data.count}
            />
          </TeamActionsProvider>
        </TabsContent>
        <TabsContent value="invites">
          <InvitesTable
            data={inviteData.invites}
            count={inviteData.count}
            teamId={team._id}
          />
        </TabsContent>
        {showRealmTab && (
          <TabsContent value="realm">
            <RealmTab team={team} realm={realm} memberCount={userData.count} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
