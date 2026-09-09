import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ConfigsTable } from '@/components/embeddings/configs/configs-table';
import { ErrorCard } from '@/components/error/ErrorCard';
import { Button } from '@/components/ui/button';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { getBackfills, getEmbeddingConfigs } from '@/lib/api/embeddings';
import { resolveIndexesBySchema } from '@/lib/api/embeddings/indexes';
import {
  buildConfigListRows,
  settledError,
  settledValue,
} from '@/lib/models/embeddings';

export default async function EmbeddingConfigsPage() {
  const [configsResult, backfillsResult] = await Promise.allSettled([
    getEmbeddingConfigs(),
    getBackfills({ skip: 0, limit: 100 }),
  ]);

  const configsError = settledError(configsResult);
  if (configsError) {
    return (
      <ErrorCard
        title="Configs unavailable"
        message={configsError}
        actions={
          <Button variant="outline" asChild>
            <Link href="/embeddings">Embeddings overview</Link>
          </Button>
        }
      />
    );
  }

  const configs = settledValue(configsResult) ?? [];
  const runs = settledValue(backfillsResult)?.runs ?? [];
  const indexesBySchema = await resolveIndexesBySchema(
    configs.map(config => config.schemaName)
  );
  const rows = buildConfigListRows(configs, indexesBySchema, runs);

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div>
          <PageTitle>Configs</PageTitle>
          <PageDescription>Schema embedding configurations.</PageDescription>
        </div>
        <PageActions className="flex-wrap">
          <Button asChild>
            <Link href="/embeddings/configs/new">
              <Plus className="size-4" />
              New config
            </Link>
          </Button>
        </PageActions>
      </PageHeader>
      <ConfigsTable rows={rows} />
    </div>
  );
}
