'use client';

import Link from 'next/link';
import { EmbeddingsReadiness } from '@/components/embeddings/EmbeddingsReadiness';
import { ConfigEditForm } from '@/components/embeddings/configs/config-edit-form';
import { ConfigIndexCard } from '@/components/embeddings/configs/config-index-card';
import {
  PageActions,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import {
  EmbeddingConfigEnableBlock,
  MatchingIndexView,
} from '@/lib/models/embeddings/index-state';
import { ReadinessRow } from '@/lib/models/embeddings/readiness';
import { EmbeddingSchemaFormChoice } from '@/lib/models/embeddings/source-fields';
import { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';

type ConfigDetailProps = {
  config: EmbeddingConfig;
  schemas: EmbeddingSchemaFormChoice[];
  providers: ConfigProviderChoice[];
  modelBlocked: boolean;
  index: MatchingIndexView;
  enableAllowed: boolean;
  enableBlock?: EmbeddingConfigEnableBlock;
  readinessRows: ReadinessRow[];
};

export function ConfigDetail({
  config,
  schemas,
  providers,
  modelBlocked,
  index,
  enableAllowed,
  enableBlock,
  readinessRows,
}: ConfigDetailProps) {
  return (
    <div className="flex flex-col space-y-6">
      <PageHeader className="flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <PageTitle className="text-balance">{config.schemaName}</PageTitle>
          <PageDescription>
            Target field {config.targetField}. Indexes stay read-only here.
          </PageDescription>
        </div>
        <PageActions className="flex-wrap">
          <Button variant="outline" asChild>
            <Link href={`/embeddings/backfills?config=${config._id}`}>
              Backfills
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/embeddings/test?configId=${config._id}`}>
              Test Search
            </Link>
          </Button>
        </PageActions>
      </PageHeader>
      <ConfigIndexCard index={index} />
      <EmbeddingsReadiness rows={readinessRows} />
      <ConfigEditForm
        config={config}
        schemas={schemas}
        providers={providers}
        modelBlocked={modelBlocked}
        enableAllowed={enableAllowed}
        enableBlockedReason={enableBlock?.reason}
        enableBlockedHref={enableBlock?.href}
        enableBlockedAction={enableBlock?.actionLabel}
      />
    </div>
  );
}
