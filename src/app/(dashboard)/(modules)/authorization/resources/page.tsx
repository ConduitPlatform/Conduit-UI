import ResourcesPageComponent from '@/components/authorization/resources/resources-page';
import {
  createResourceDefinition,
  deleteResourceDefinition,
  getResourceDefinitions,
  patchResourceDefinition,
} from '@/lib/api/authorization';
import {
  CreateResourceDefinition,
  ResourceDefinition,
} from '@/lib/models/authorization';

export default async function AuthorizationPage() {
  const { resources } = await getResourceDefinitions({ skip: 0, limit: 1000 });
  const handleSaveResource = async (
    resource: ResourceDefinition | CreateResourceDefinition
  ) => {
    'use server';
    let newResource: ResourceDefinition;
    if ('_id' in resource) {
      let { resourceDefinition } = await patchResourceDefinition({
        ...resource,
        version: resource.version + 1,
      });
      newResource = resourceDefinition;
    } else {
      let { resourceDefinition } = await createResourceDefinition(resource);
      newResource = resourceDefinition;
    }
    return newResource;
  };

  const handleDelete = async (resourceId: string) => {
    'use server';
    await deleteResourceDefinition(resourceId);
  };

  return (
    <ResourcesPageComponent
      resources={resources}
      onSave={handleSaveResource}
      onDelete={handleDelete}
    />
  );
}
