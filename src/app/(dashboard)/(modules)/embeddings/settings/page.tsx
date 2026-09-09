import Link from 'next/link';
import { EmbeddingsSettings } from '@/components/embeddings/settings/embeddings-settings';
import { ErrorCard } from '@/components/error/ErrorCard';
import { Button } from '@/components/ui/button';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { getEmbeddingsSettings } from '@/lib/api/embeddings';
import { getModules } from '@/lib/api/modules';
import { isModuleServing } from '@/lib/api/modules/patch-settings-options';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';

export default async function EmbeddingsSettingsPage() {
  const [settingsResult, modulesResult] = await Promise.allSettled([
    getEmbeddingsSettings(),
    getModules(),
  ]);

  if (settingsResult.status === 'rejected') {
    return (
      <ErrorCard
        title="Settings unavailable"
        message={formatEmbeddingsApiError(settingsResult.reason)}
        actions={
          <Button variant="outline" asChild>
            <Link href="/embeddings">Embeddings overview</Link>
          </Button>
        }
      />
    );
  }

  const serving =
    modulesResult.status === 'fulfilled'
      ? isModuleServing(modulesResult.value, 'embeddings')
      : undefined;

  return (
    <div className="flex flex-col space-y-4">
      <PageHeader>
        <div>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Provider, workers, and operational limits.
          </PageDescription>
        </div>
      </PageHeader>
      <EmbeddingsSettings
        data={settingsResult.value.config}
        serving={serving}
      />
    </div>
  );
}
