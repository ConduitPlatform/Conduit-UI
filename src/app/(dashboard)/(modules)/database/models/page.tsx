import {
  getDatabaseType,
  getSchemas,
  getSchemaOwnerModules,
} from '@/lib/api/database';
import { ModelsPage } from '@/components/database/models/models-page';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

type ModelsProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    owner?: string;
  }>;
};

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function parseOwners(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export default async function Models(props: Readonly<ModelsProps>) {
  const searchParams = await props.searchParams;

  const page = parsePage(searchParams.page);
  const search = searchParams.search?.trim() || '';
  const owners = parseOwners(searchParams.owner);

  const [schemasData, modulesData, dbTypeRes] = await Promise.all([
    getSchemas({
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      enabled: true,
      search: search || undefined,
      owner: owners.length > 0 ? owners : undefined,
    }),
    getSchemaOwnerModules({ sort: 'name' }),
    getDatabaseType(),
  ]);

  return (
    <ModelsPage
      schemas={schemasData.schemas}
      modules={modulesData.modules}
      selectedModelId={null}
      databaseType={dbTypeRes.result}
      count={schemasData.count}
      page={page}
      pageSize={PAGE_SIZE}
      initialSearch={search}
      initialOwners={owners}
    />
  );
}
