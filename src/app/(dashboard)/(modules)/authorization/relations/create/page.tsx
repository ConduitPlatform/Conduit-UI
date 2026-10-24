import CreateRelationForm from '@/components/authorization/relations/create-relation';
import { getResourceDefinitions } from '@/lib/api/authorization';
import { ResourceDefinition } from '@/lib/models/authorization';

export default async function CreateRelation() {
  const { resources } = await getResourceDefinitions({ skip: 0, limit: 1000 });

  const namedResources: { [key: string]: ResourceDefinition } = {};
  resources.forEach(resource => {
    namedResources[resource.name] = resource;
  });
  return <CreateRelationForm resourceTypes={namedResources} />;
}
