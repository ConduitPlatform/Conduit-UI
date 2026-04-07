import PermissionChecker from '@/components/authorization/permissions/permission-checker';
import { getResourceDefinitions } from '@/lib/api/authorization';
import { PageHeader, PageTitle } from '@/components/ui/page-header';

export default async function CheckPermissionsPage() {
  const { resources } = await getResourceDefinitions({ skip: 0, limit: 1000 });

  return (
    <div className="container mx-auto py-6">
      <PageHeader>
        <PageTitle>Check Permissions</PageTitle>
      </PageHeader>

      <PermissionChecker resources={resources} />
    </div>
  );
}
