import { getModules } from '@/lib/api/modules';
import { getResourceDefinition } from '@/lib/api/authorization';
import { ResourceDefinition } from '@/lib/models/authorization';
import ModuleResourcePage from '@/components/authorization/resources/moduleResourcePage';

export default async function PermissionsModels() {
  const data = await getModules().catch(() => null);
  let authzActive = false;
  if (data) {
    authzActive = !!data.find(
      module => module.moduleName === 'authorization' && module.serving
    );
  }
  if (!data || !authzActive)
    return (
      <div>
        Authorization module not available. Please make sure it is installed and
        running.
      </div>
    );

  let resources: ResourceDefinition[] = [];
  const userDef = await getResourceDefinition('User');
  const teamDef = await getResourceDefinition('Team');
  if (userDef) {
    resources.push(userDef);
  }
  if (teamDef) {
    resources.push(teamDef);
  }

  return <ModuleResourcePage resources={resources} />;
}
