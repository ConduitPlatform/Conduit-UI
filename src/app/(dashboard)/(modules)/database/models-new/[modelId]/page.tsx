import {
  getSchema,
  getSchemas,
  getSchemaDocs,
  getSchemaOwnerModules,
} from '@/lib/api/database';
import {
  ModelsNewPage,
  type ModelsNewTab,
} from '@/components/database-new/models-page';
import { getResourceDefinition } from '@/lib/api/authorization';
import { ResourceDefinition } from '@/lib/models/authorization';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    modelId: string;
  }>;
  searchParams: Promise<{
    search?: string;
    pageIndex?: string;
    limit?: string;
    tab?: string;
  }>;
};

export default async function ModelDetailPage(props: Readonly<PageProps>) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const [schemasData, modulesData, schema] = await Promise.all([
    getSchemas({ limit: 1000, enabled: true }),
    getSchemaOwnerModules({ sort: 'name' }),
    getSchema(params.modelId),
  ]);

  // Fetch documents for the selected schema
  const docs = await getSchemaDocs(
    schema.name,
    searchParams?.search
      ? { query: JSON.parse(searchParams.search) }
      : undefined,
    {
      skip: searchParams?.pageIndex
        ? Number(searchParams.pageIndex) * Number(searchParams?.limit ?? 20)
        : 0,
      limit: Number(searchParams?.limit ?? 20),
    }
  );

  // Fetch authorization resource if enabled
  let resource: ResourceDefinition | null = null;
  if (schema.modelOptions?.conduit?.authorization?.enabled) {
    const authResource = await getResourceDefinition(schema.name);
    resource = authResource ?? null;
  }

  const tabParam = searchParams?.tab;
  const initialTab: ModelsNewTab | undefined =
    tabParam === 'schema' ||
    tabParam === 'data' ||
    tabParam === 'extensions' ||
    tabParam === 'settings'
      ? tabParam
      : undefined;

  return (
    <ModelsNewPage
      schemas={schemasData.schemas}
      modules={modulesData.modules}
      selectedModelId={params.modelId}
      selectedSchema={schema}
      documents={docs}
      authResource={resource}
      initialTab={initialTab}
    />
  );
}
