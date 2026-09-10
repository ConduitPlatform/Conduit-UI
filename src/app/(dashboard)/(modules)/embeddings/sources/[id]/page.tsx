import { notFound } from 'next/navigation';
import { SourceDetail } from '@/components/embeddings/sources/source-detail';
import {
  getEmbeddingSource,
  getEmbeddingSourceStatus,
  getEmbeddingsSettings,
} from '@/lib/api/embeddings';
import {
  loadContainerOptions,
  loadTeamOptions,
} from '@/lib/api/embeddings/source-options';
import {
  isEmbeddingsNotFound,
  settle,
  settledError,
  settledValue,
} from '@/lib/models/embeddings/errors';
import {
  isConfigModelInCatalogue,
  listConfiguredProviders,
} from '@/lib/models/embeddings/config-catalogue';
import {
  parseStorageSelectors,
  storageExtractionLimitsFromSettings,
} from '@/lib/models/embeddings/source';

export default async function EmbeddingSourceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [sourceResult, settingsResult] = await Promise.allSettled([
    getEmbeddingSource(id),
    getEmbeddingsSettings(),
  ]);

  if (sourceResult.status === 'rejected') {
    if (isEmbeddingsNotFound(sourceResult.reason)) notFound();
    throw sourceResult.reason;
  }

  const source = sourceResult.value;
  const selectors = parseStorageSelectors(source.selectors);
  const [statusResult, teams, containers] = await Promise.all([
    settle(getEmbeddingSourceStatus(id)),
    loadTeamOptions(source.partitionSubject),
    loadContainerOptions(selectors?.container),
  ]);
  const settings = settledValue(settingsResult)?.config;
  const providers = listConfiguredProviders(settings);
  const modelBlocked =
    settings != null && !isConfigModelInCatalogue(source, providers);

  return (
    <SourceDetail
      source={source}
      status={settledValue(statusResult)}
      statusError={settledError(statusResult)}
      providers={providers}
      modelBlocked={modelBlocked}
      teams={teams.items}
      containers={containers.items}
      limits={storageExtractionLimitsFromSettings(settings)}
      teamsError={teams.error}
      containersError={containers.error}
      teamsTruncated={teams.truncated}
      containersTruncated={containers.truncated}
      teamsTotal={teams.total}
      containersTotal={containers.total}
    />
  );
}
