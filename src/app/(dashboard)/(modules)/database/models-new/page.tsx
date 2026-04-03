import { getSchemas, getSchemaOwnerModules } from '@/lib/api/database';
import { ModelsNewPage } from '@/components/database-new/models-page';

export const dynamic = 'force-dynamic';

export default async function ModelsNew() {
  const [schemasData, modulesData] = await Promise.all([
    getSchemas({ limit: 1000, enabled: true }),
    getSchemaOwnerModules({ sort: 'name' }),
  ]);

  return (
    <ModelsNewPage
      schemas={schemasData.schemas}
      modules={modulesData.modules}
      selectedModelId={null}
    />
  );
}
