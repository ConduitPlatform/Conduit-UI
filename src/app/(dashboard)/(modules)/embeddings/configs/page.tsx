import Link from 'next/link';
import { ConfigsTable } from '@/components/embeddings/configs/configs-table';
import { NewSourceMenu } from '@/components/embeddings/sources/new-source-menu';
import { ErrorCard } from '@/components/error/ErrorCard';
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
  listEmbeddingSources,
} from '@/lib/api/embeddings';
import {
  getDeclaredSchemas,
  resolveIndexesBySchema,
} from '@/lib/api/embeddings/indexes';
import { buildConfigListRows } from '@/lib/models/embeddings/index-state';
import {
  isConfigModelInCatalogue,
  listConfiguredProviders,
} from '@/lib/models/embeddings/config-catalogue';
import { settledError, settledValue } from '@/lib/models/embeddings/errors';
import {
  schemaCatalogRow,
  sourceCatalogRow,
} from '@/lib/models/embeddings/catalog';

export default async function EmbeddingConfigsPage() {
  const [
    configsResult,
    sourcesResult,
    backfillsResult,
    schemasResult,
    settingsResult,
  ] = await Promise.allSettled([
    getEmbeddingConfigs(),
    listEmbeddingSources(),
    getBackfills({ skip: 0, limit: 100 }),
    getDeclaredSchemas(),
    getEmbeddingsSettings(),
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
  const sourceList = settledValue(sourcesResult);
  const sources = sourceList?.sources ?? [];
  const runs = settledValue(backfillsResult)?.runs ?? [];
  const settings = settledValue(settingsResult)?.config;
  const providers = listConfiguredProviders(settings);
  const modelBlockedIds = new Set(
    settings
      ? configs
          .filter(config => !isConfigModelInCatalogue(config, providers))
          .map(config => config._id)
      : []
  );
  const indexesBySchema = await resolveIndexesBySchema(
    configs.map(config => config.schemaName),
    settledValue(schemasResult)
  );
  const schemaRows = buildConfigListRows(
    configs,
    indexesBySchema,
    runs,
    modelBlockedIds
  ).map(schemaCatalogRow);
  const rows = [
    ...schemaRows,
    ...sources.map(source =>
      sourceCatalogRow(
        source,
        settings != null && !isConfigModelInCatalogue(source, providers)
      )
    ),
  ];

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div>
          <PageTitle>Configs</PageTitle>
          <PageDescription>
            Database schemas, Conduit Storage, and External sources.
          </PageDescription>
        </div>
        <PageActions className="flex-wrap">
          <NewSourceMenu />
        </PageActions>
      </PageHeader>
      {settledError(sourcesResult) ? (
        <p className="text-sm text-muted-foreground">
          Generic sources could not be loaded. Schema configs are still shown.
        </p>
      ) : sourceList?.truncated ? (
        <p className="text-sm text-muted-foreground">
          Showing {sources.length.toLocaleString()} of{' '}
          {sourceList.count.toLocaleString()} generic sources.
        </p>
      ) : null}
      <ConfigsTable rows={rows} />
    </div>
  );
}
