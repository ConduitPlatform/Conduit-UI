import Link from 'next/link';
import { TestSearch } from '@/components/embeddings/search/test-search';
import { ErrorCard } from '@/components/error/ErrorCard';
import { Button } from '@/components/ui/button';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import {
  getEmbeddingConfigs,
  getEmbeddingsCapabilities,
  getEmbeddingsSettings,
  getEmbeddingsStatus,
} from '@/lib/api/embeddings';
import {
  getDeclaredSchemas,
  resolveIndexesBySchema,
} from '@/lib/api/embeddings/indexes';
import { settledError, settledValue } from '@/lib/models/embeddings/errors';
import { workersEnabledFromStatus } from '@/lib/models/embeddings/overview-view';
import { readSearchParam } from '@/lib/models/embeddings/backfill-view';
import { buildSearchPageModel } from '@/lib/models/embeddings/search-view';
import { filterByEligibleSchemas } from '@/lib/models/embeddings/source-fields';

export default async function EmbeddingsTestSearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const [
    configsResult,
    statusResult,
    capabilitiesResult,
    settingsResult,
    schemasResult,
  ] = await Promise.allSettled([
    getEmbeddingConfigs(),
    getEmbeddingsStatus(),
    getEmbeddingsCapabilities(),
    getEmbeddingsSettings(),
    getDeclaredSchemas(),
  ]);

  const configsError = settledError(configsResult);
  if (configsError) {
    return (
      <ErrorCard
        title="Test Search unavailable"
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
  const status = settledValue(statusResult);
  const capabilities =
    settledValue(capabilitiesResult)?.capabilities ?? status?.capabilities;
  const settings = settledValue(settingsResult)?.config;
  const declaredSchemas = settledValue(schemasResult)?.schemas;
  const searchableConfigs = filterByEligibleSchemas(configs, declaredSchemas);
  const indexesBySchema = await resolveIndexesBySchema(
    searchableConfigs.map(config => config.schemaName),
    declaredSchemas
  );
  const workersEnabled = workersEnabledFromStatus({
    status,
    settingsEnabled: settings?.enabled,
  });
  const model = buildSearchPageModel({
    configs: searchableConfigs,
    indexesBySchema,
    capabilities,
    capabilitiesError: settledError(capabilitiesResult),
    settings,
    settingsError: settledError(settingsResult),
    workersEnabled,
    configId:
      readSearchParam(searchParams.configId) ??
      readSearchParam(searchParams.config),
    schemaName:
      readSearchParam(searchParams.schema) ??
      readSearchParam(searchParams.schemaName),
  });

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div>
          <PageTitle>Test Search</PageTitle>
          <PageDescription>
            Run semantic search against a ready config.
          </PageDescription>
        </div>
      </PageHeader>
      <TestSearch
        configs={model.configs}
        schemas={model.schemas}
        fallbackRows={model.fallbackRows}
        readinessByConfigId={model.readinessByConfigId}
        workersEnabled={workersEnabled}
        initialConfigId={model.initialConfigId}
        initialSchema={model.initialSchema}
      />
    </div>
  );
}
