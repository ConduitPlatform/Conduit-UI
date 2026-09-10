import { notFound } from 'next/navigation';
import { CreateSourceForm } from '@/components/embeddings/sources/create-source-form';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { getEmbeddingsSettings } from '@/lib/api/embeddings';
import {
  loadContainerOptions,
  loadTeamOptions,
} from '@/lib/api/embeddings/source-options';
import { settle, settledValue } from '@/lib/models/embeddings/errors';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';
import {
  listConfiguredProviders,
  resolveCreateDefaults,
} from '@/lib/models/embeddings/config-catalogue';
import {
  isEmbeddingSourceKind,
  sourceKindLabel,
  storageExtractionLimitsFromSettings,
} from '@/lib/models/embeddings/source';

export default async function NewEmbeddingSourcePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const kindParam = Array.isArray(searchParams.kind)
    ? searchParams.kind[0]
    : searchParams.kind;
  if (!isEmbeddingSourceKind(kindParam)) notFound();

  const [settingsResult, teams, containers] = await Promise.all([
    settle(getEmbeddingsSettings()),
    loadTeamOptions(),
    loadContainerOptions(),
  ]);

  const settings = settledValue(settingsResult)?.config;
  const providers = listConfiguredProviders(settings);
  const defaults = resolveCreateDefaults({
    providers,
    defaultProvider: settings?.defaultProvider || OPENAI_COMPATIBLE_PROVIDER,
    defaultModel: settings
      ? (settings.providers[settings.defaultProvider]?.defaultModel ?? '')
      : '',
  });

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader>
        <div>
          <PageTitle>New {sourceKindLabel(kindParam)} source</PageTitle>
          <PageDescription>
            {kindParam === 'conduit-storage'
              ? 'Choose a container, optional folder prefix, and MIME types. Profile and team scope are fixed after create.'
              : 'Label, profile, and team scope. Ingest happens through trusted API or gRPC after save.'}
          </PageDescription>
        </div>
      </PageHeader>
      <CreateSourceForm
        kind={kindParam}
        providers={providers}
        defaultProvider={defaults.provider}
        defaultModel={defaults.model}
        defaultDimensions={defaults.dimensions}
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
    </div>
  );
}
