import { getTeam, getTeamMembers, getTeams } from '@/lib/api/authentication';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { MemberActionsProvider } from '@/components/authentication/teams/manageTeam/members/MemberActionsProvider';
import MembersTable from '@/components/authentication/teams/manageTeam/members/members';
import TeamProfile from '@/components/authentication/teams/manageTeam/teamProfile';
import { TeamActionsProvider } from '@/components/authentication/teams/TeamActionsProvider';
import TeamsTable from '@/components/authentication/teams/teams';

export const dynamic = 'force-dynamic';

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

  const data = await getTeams(skip ?? 0, limit ?? 10, {
    ...queryParams,
    parentTeam: params._id,
  });
  const userData = await getTeamMembers(
    params._id,
    searchParams.skip ?? 0,
    searchParams.limit ?? 10,
    { ...searchParams }
  );

  return (
    <div className={'flex flex-col w-full gap-y-2'}>
      <TeamProfile
        team={team}
        parentTeam={parentTeam}
        subTeamCount={data.count}
        memberCount={userData.count}
      />
      <Tabs
        defaultValue={searchParams.mode === 'subteams' ? 'subteams' : 'members'}
      >
        <TabsList className="grid grid-cols-2 w-[400px]">
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
      </Tabs>
    </div>
  );
}
