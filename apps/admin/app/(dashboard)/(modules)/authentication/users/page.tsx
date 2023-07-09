import { getUsers } from '@/lib/api/authentication';
import UsersTable from '@/components/authentication/users/users';

export default async function DemoPage({ searchParams }: {
  searchParams: {
    skip: number,
    limit: number,
    sort?: string,
    search?: string,
    isActive?: boolean,
    provider?: string
  }
}) {
  const queryParams = {...searchParams};

  const data = await getUsers(searchParams.skip ?? 0, searchParams.limit ?? 20, { ...searchParams });

  return <UsersTable data={data.users} count={data.count} />;
}
