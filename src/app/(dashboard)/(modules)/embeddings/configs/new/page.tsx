import { CreateConfigForm } from '@/components/embeddings/configs/create-config-form';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { getDeclaredSchemas } from '@/lib/api/embeddings/indexes';
import { getEmbeddingsSettings } from '@/lib/api/embeddings';
import { settledValue } from '@/lib/models/embeddings/errors';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';
import {
  listConfiguredProviders,
  resolveCreateDefaults,
} from '@/lib/models/embeddings/config-catalogue';
import {
  listEligibleSchemas,
  toEmbeddingSchemaFormChoices,
} from '@/lib/models/embeddings/source-fields';

export default async function NewEmbeddingConfigPage() {
  const [schemasResult, settingsResult] = await Promise.allSettled([
    getDeclaredSchemas(),
    getEmbeddingsSettings(),
  ]);

  const schemas = toEmbeddingSchemaFormChoices(
    listEligibleSchemas(settledValue(schemasResult)?.schemas ?? [])
  );
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
          <PageTitle>New config</PageTitle>
          <PageDescription>
            Choose a schema and eligible string fields. The config stays
            disabled until a matching index is queryable.
          </PageDescription>
        </div>
      </PageHeader>
      <CreateConfigForm
        schemas={schemas}
        providers={providers}
        defaultProvider={defaults.provider}
        defaultModel={defaults.model}
        defaultDimensions={defaults.dimensions}
      />
    </div>
  );
}
