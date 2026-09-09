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
import { resolveIndexesBySchema } from '@/lib/api/embeddings/indexes';
import {
  formatEmbeddingsApiError,
  readSearchParam,
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

export default async function EmbeddingsTestSearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const [configsResult, statusResult, capabilitiesResult, settingsResult] =
    await Promise.allSettled([
      getEmbeddingConfigs(),
      getEmbeddingsStatus(),
      getEmbeddingsCapabilities(),
      getEmbeddingsSettings(),
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
  const indexesBySchema = await resolveIndexesBySchema(
    configs.map(config => config.schemaName)
  );

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader>
        <div>
          <PageTitle>Test Search</PageTitle>
          <PageDescription>
            Run semantic search against a ready config.
          </PageDescription>
        </div>
      </PageHeader>
      <TestSearch
        configs={configs}
        indexesBySchema={indexesBySchema}
        capabilities={capabilities}
        capabilitiesError={settledError(capabilitiesResult)}
        settings={settings}
        settingsError={settledError(settingsResult)}
        workersEnabled={status?.enabled ?? settings?.enabled}
        initialConfigId={
          readSearchParam(searchParams.configId) ??
          readSearchParam(searchParams.config)
        }
        initialSchema={
          readSearchParam(searchParams.schema) ??
          readSearchParam(searchParams.schemaName)
        }
      />
    </div>
  );
}
