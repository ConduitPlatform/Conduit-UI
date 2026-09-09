import { CreateConfigForm } from '@/components/embeddings/configs/create-config-form';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { getSchemas } from '@/lib/api/database';
import { getEmbeddingsSettings } from '@/lib/api/embeddings';
import {
  listEligibleSchemas,
  OPENAI_COMPATIBLE_PROVIDER,
  settledValue,
} from '@/lib/models/embeddings';

export default async function NewEmbeddingConfigPage() {
  const [schemasResult, settingsResult] = await Promise.allSettled([
    getSchemas({ limit: 1000, enabled: true }),
    getEmbeddingsSettings(),
  ]);

  const schemas = listEligibleSchemas(
    settledValue(schemasResult)?.schemas ?? []
  );
  const settings = settledValue(settingsResult)?.config;
  const provider = settings?.defaultProvider || OPENAI_COMPATIBLE_PROVIDER;
  const model = settings?.providers[provider]?.model ?? '';

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
        defaultProvider={provider}
        defaultModel={model}
      />
    </div>
  );
}
