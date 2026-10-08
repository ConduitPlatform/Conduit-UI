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
import {
  getBackfills,
  getEmbeddingConfigs,
  getEmbeddingsSettings,
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

export default async function EmbeddingConfigsPage() {
  const [configsResult, backfillsResult, schemasResult, settingsResult] =
    await Promise.allSettled([
      getEmbeddingConfigs(),
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
  const rows = buildConfigListRows(
    configs,
    indexesBySchema,
    runs,
    modelBlockedIds
  );

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div>
          <PageTitle>Configs</PageTitle>
          <PageDescription>
            Source fields, target field, and matching index.
          </PageDescription>
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
