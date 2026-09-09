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
import { VectorCapabilities } from '@/lib/models/embeddings/capabilities';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import { canEnableEmbeddingConfig } from '@/lib/models/embeddings/index-state';
import {
  findMatchingIndex,
  ReadinessRow,
  SchemaIndexLookup,
} from '@/lib/models/embeddings/readiness';
import { EmbeddingSchemaChoice } from '@/lib/models/embeddings/source-fields';

type ConfigDetailProps = {
  config: EmbeddingConfig;
  schemas: EmbeddingSchemaChoice[];
  lookup?: SchemaIndexLookup;
  capabilities?: VectorCapabilities;
  readinessRows: ReadinessRow[];
};

export function ConfigDetail({
  config,
  schemas,
  lookup,
  capabilities,
  readinessRows,
}: ConfigDetailProps) {
  const matchingIndex =
    lookup && lookup !== 'unknown'
      ? findMatchingIndex(config, lookup)
      : undefined;
  const enableAllowed = canEnableEmbeddingConfig({
    capabilities,
    matchingIndex,
  });

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
      <ConfigIndexCard config={config} lookup={lookup} />
      <EmbeddingsReadiness rows={readinessRows} />
      <ConfigEditForm
        config={config}
        schemas={schemas}
        enableAllowed={enableAllowed}
      />
    </div>
  );
}
