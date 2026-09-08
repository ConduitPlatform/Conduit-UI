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
  formatEmbeddingsApiError,
} from '@/lib/models/embeddings';

function settledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

function settledError(
  result: PromiseSettledResult<unknown>
): string | undefined {
  if (result.status !== 'rejected') return undefined;
  return formatEmbeddingsApiError(result.reason);
}

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
      <PageHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div>
          <PageTitle>Configs</PageTitle>
          <PageDescription>
            Schema embedding configurations and matching index readiness.
          </PageDescription>
        </div>
        <PageActions>
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
