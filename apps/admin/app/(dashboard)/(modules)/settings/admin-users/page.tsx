import { AdminActionsProvider } from '@/components/settings/admin-users/AdminsProvider';
import AdminTable from '@/components/settings/admin-users/AdminTable';

export default async function AdminUsers({ searchParams }: {
  searchParams: {
    skip: number,
    limit: number,
    sort?: string,
    search?: string,
    isActive?: boolean,
    provider?: string
  }
}) {
  const queryParams = { ...searchParams };

  const data = {users:[{_id: 'some id', email: 'email', isVerified: true}], count:1}
  return <AdminActionsProvider><AdminTable data={data.users} count={data.count} /></AdminActionsProvider>;
}