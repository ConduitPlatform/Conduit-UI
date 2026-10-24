import AdminTable from '@/components/settings/admin-users/AdminTable';
import { getAdminById, getAdmins } from '@/lib/api/settings/admins';

export default async function AdminUsers(props: {
  searchParams: Promise<{
    skip: number;
    limit: number;
  }>;
}) {
  const searchParams = await props.searchParams;
  const loggedUser = await getAdminById('me');
  const data = await getAdmins(
    searchParams.skip ?? 0,
    searchParams.limit ?? 20
  );

  return (
    <AdminTable data={data.admins} count={data.count} loggedUser={loggedUser} />
  );
}
