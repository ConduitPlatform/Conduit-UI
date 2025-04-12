import PermissionChecker from '@/components/authorization/permissions/permission-checker';
import { getResourceDefinitions } from '@/lib/api/authorization';

export default async function CheckPermissionsPage() {
  const { resources } = await getResourceDefinitions({ skip: 0, limit: 1000 });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Check Permissions</h1>

      <PermissionChecker resources={resources} />
    </div>
  );
}
