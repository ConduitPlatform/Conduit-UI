import { getTeamMembers, getTeams } from '@/lib/api/authentication';
import { TeamActionsProvider } from '@/components/authentication/teams/TeamActionsProvider';
import TeamsTable from '@/components/authentication/teams/teams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserActionsProvider } from '@/components/authentication/users/UserActionsProvider';
import UsersTable from '@/components/authentication/users/users';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Teams({ searchParams, params }: {
  searchParams: {
    skip: number,
    limit: number,
    mode?: string,
    sort?: string,
    search?: string,
    parentTeam?: string
  },
  params: {
    _id: string
  }
}) {
  const { skip, limit, ...queryParams } = searchParams;

  const data = await getTeams(skip ?? 0, limit ?? 20, { ...queryParams, parentTeam: params._id });
  const userData = await getTeamMembers(params._id, searchParams.skip ?? 0, searchParams.limit ?? 20, { ...searchParams });

  return (
    <Tabs defaultValue={searchParams.mode === 'subteams' ? 'subteams' : 'members'}>
      <TabsList className='grid grid-cols-2 w-[400px]'>
        <TabsTrigger value='members' asChild>
          <Link href={`/authentication/teams/${params._id}?mode=members`}>
            Members</Link>
        </TabsTrigger>
        <TabsTrigger value='subteams' asChild><Link href={`/authentication/teams/${params._id}?mode=subteams`}>
          Teams</Link></TabsTrigger>
      </TabsList>
      <TabsContent value='members'>
        <UserActionsProvider><UsersTable data={userData.members} count={data.count} /></UserActionsProvider>
      </TabsContent>
      <TabsContent value='subteams'>
        <TeamActionsProvider><TeamsTable data={data.teams} /></TeamActionsProvider>
      </TabsContent>
    </Tabs>

  );
}
