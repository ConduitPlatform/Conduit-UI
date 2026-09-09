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
  openaiCompatibleProvider,
  resolveProviderDefaultModel,
} from '@/lib/models/embeddings/settings-form';
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
  const providerName = settings?.defaultProvider || OPENAI_COMPATIBLE_PROVIDER;
  const model = resolveProviderDefaultModel(
    settings ? openaiCompatibleProvider(settings) : undefined
  );

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
        defaultProvider={providerName}
        defaultModel={model}
      />
    </div>
  );
}
