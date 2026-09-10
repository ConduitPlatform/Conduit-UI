import { notFound } from 'next/navigation';
import { SourceDetail } from '@/components/embeddings/sources/source-detail';
import {
  getEmbeddingSource,
  getEmbeddingSourceStatus,
  getEmbeddingsSettings,
} from '@/lib/api/embeddings';
import { getTeams } from '@/lib/api/authentication';
import { getContainers } from '@/lib/api/storage';
import {
  isEmbeddingsNotFound,
  settledError,
  settledValue,
} from '@/lib/models/embeddings/errors';
import {
  isConfigModelInCatalogue,
  listConfiguredProviders,
} from '@/lib/models/embeddings/config-catalogue';
import { storageExtractionLimitsFromSettings } from '@/lib/models/embeddings/source';

export default async function EmbeddingSourceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [sourceResult, settingsResult, teamsResult, containersResult] =
    await Promise.allSettled([
      getEmbeddingSource(id),
      getEmbeddingsSettings(),
      getTeams(0, 100),
      getContainers({ skip: 0, limit: 100 }),
    ]);

  if (sourceResult.status === 'rejected') {
    if (isEmbeddingsNotFound(sourceResult.reason)) notFound();
    throw sourceResult.reason;
  }

  const source = sourceResult.value;
  const statusResult = await Promise.allSettled([
    getEmbeddingSourceStatus(id),
  ]).then(results => results[0]);
  const settings = settledValue(settingsResult)?.config;
  const providers = listConfiguredProviders(settings);
  const modelBlocked =
    settings != null && !isConfigModelInCatalogue(source, providers);
  const teams = (settledValue(teamsResult)?.teams ?? []).map(team => ({
    id: team._id,
    name: team.name,
  }));
  const containers = (settledValue(containersResult)?.containers ?? []).map(
    container => ({
      id: container._id,
      name: container.name,
    })
  );

  return (
    <SourceDetail
      source={source}
      status={settledValue(statusResult)}
      statusError={settledError(statusResult)}
      providers={providers}
      modelBlocked={modelBlocked}
      teams={teams}
      containers={containers}
      limits={storageExtractionLimitsFromSettings(settings)}
    />
  );
}
