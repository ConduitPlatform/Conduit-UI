import Link from 'next/link';
import { Info } from 'lucide-react';
import { BackfillsTable } from '@/components/embeddings/backfills/backfills-table';
import { StartBackfillDialog } from '@/components/embeddings/backfills/start-backfill-dialog';
import { ErrorCard } from '@/components/error/ErrorCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import {
  getBackfills,
  getEmbeddingConfigs,
  getEmbeddingsSettings,
  getEmbeddingsStatus,
} from '@/lib/api/embeddings';
import {
  formatEmbeddingsApiError,
  mergeActiveBackfillRuns,
  parseBackfillListParams,
  toBackfillListQuery,
  uniqueSchemaNames,
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

export default async function EmbeddingBackfillsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const query = parseBackfillListParams(searchParams);
  const listQuery = toBackfillListQuery(query);

  const [
    listResult,
    queuedResult,
    runningResult,
    configsResult,
    settingsResult,
    statusResult,
  ] = await Promise.allSettled([
    getBackfills(listQuery),
    query.state
      ? Promise.resolve({ runs: [], count: 0 })
      : getBackfills({ ...listQuery, state: 'queued', skip: 0, limit: 100 }),
    query.state
      ? Promise.resolve({ runs: [], count: 0 })
      : getBackfills({ ...listQuery, state: 'running', skip: 0, limit: 100 }),
    getEmbeddingConfigs(),
    getEmbeddingsSettings(),
    getEmbeddingsStatus(),
  ]);

  const listError = settledError(listResult);
  if (listError) {
    return (
      <ErrorCard
        title="Backfills unavailable"
        message={listError}
        actions={
          <Button variant="outline" asChild>
            <Link href="/embeddings">Embeddings overview</Link>
          </Button>
        }
      />
    );
  }

  const list = settledValue(listResult) ?? { runs: [], count: 0 };
  const runs = mergeActiveBackfillRuns({
    pageRuns: list.runs,
    queuedRuns: settledValue(queuedResult)?.runs ?? [],
    runningRuns: settledValue(runningResult)?.runs ?? [],
    skip: query.skip,
    state: query.state,
  });
  const configs = settledValue(configsResult) ?? [];
  const schemas = uniqueSchemaNames(configs, runs);
  if (query.schema && !schemas.includes(query.schema)) {
    schemas.push(query.schema);
    schemas.sort((left, right) => left.localeCompare(right));
  }
  const settings = settledValue(settingsResult)?.config;
  const status = settledValue(statusResult);
  const workersEnabled = status?.enabled ?? settings?.enabled;

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div>
          <PageTitle>Backfills</PageTitle>
          <PageDescription>
            Filterable run history. Active runs appear first.
          </PageDescription>
        </div>
        <PageActions>
          <StartBackfillDialog
            configs={configs}
            schemas={schemas}
            maxBatchSize={settings?.queue.maxBatchSize}
            defaultSchema={query.schema}
            defaultConfig={query.config}
          />
        </PageActions>
      </PageHeader>
      {workersEnabled === false ? (
        <Alert variant="warning">
          <Info className="size-4" />
          <AlertTitle>Workers disabled</AlertTitle>
          <AlertDescription>
            History stays available.{' '}
            <Link
              href="/embeddings/settings"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Enable workers
            </Link>{' '}
            to process queued runs.
          </AlertDescription>
        </Alert>
      ) : null}
      <BackfillsTable
        runs={runs}
        count={list.count}
        query={query}
        configs={configs}
        schemas={schemas}
        hasConfigs={configs.length > 0}
      />
    </div>
  );
}
