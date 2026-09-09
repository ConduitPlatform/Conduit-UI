'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Info } from 'lucide-react';
import { EmbeddingsReadiness } from '@/components/embeddings/EmbeddingsReadiness';
import {
  SearchForm,
  type SearchFormValues,
} from '@/components/embeddings/search/search-form';
import { SearchResults } from '@/components/embeddings/search/search-results';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { searchEmbeddings } from '@/lib/api/embeddings';
import { VectorCapabilities } from '@/lib/models/embeddings/capabilities';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import {
  deriveEmbeddingsReadiness,
  SchemaIndexLookup,
} from '@/lib/models/embeddings/readiness';
import { SemanticSearchHit } from '@/lib/models/embeddings/search';
import {
  clampSearchLimit,
  pickInitialSearchConfig,
  uniqueSearchSchemas,
} from '@/lib/models/embeddings/search-view';
import { EmbeddingsSettings } from '@/lib/models/embeddings/settings';

type TestSearchProps = {
  configs: EmbeddingConfig[];
  indexesBySchema: Record<string, SchemaIndexLookup>;
  capabilities?: VectorCapabilities;
  capabilitiesError?: string;
  settings?: EmbeddingsSettings;
  settingsError?: string;
  workersEnabled?: boolean;
  initialConfigId?: string;
  initialSchema?: string;
};

export function TestSearch({
  configs,
  indexesBySchema,
  capabilities,
  capabilitiesError,
  settings,
  settingsError,
  workersEnabled,
  initialConfigId,
  initialSchema,
}: TestSearchProps) {
  const initial = pickInitialSearchConfig({
    configs,
    indexesBySchema,
    configId: initialConfigId,
    schemaName: initialSchema,
  });
  const [schemaName, setSchemaName] = useState(
    initial?.schemaName ?? initialSchema ?? ''
  );
  const [configId, setConfigId] = useState(initial?._id ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [hits, setHits] = useState<SemanticSearchHit[]>();
  const schemas = uniqueSearchSchemas(configs);
  const selected = configs.find(config => config._id === configId);
  const rows = useMemo(
    () =>
      deriveEmbeddingsReadiness({
        capabilities,
        capabilitiesError,
        settings,
        settingsError,
        configs,
        indexesBySchema,
        selectedConfigId: configId || undefined,
        workersEnabled,
      }),
    [
      capabilities,
      capabilitiesError,
      settings,
      settingsError,
      configs,
      indexesBySchema,
      configId,
      workersEnabled,
    ]
  );

  const runSearch = async (values: SearchFormValues) => {
    setPending(true);
    setError(undefined);
    try {
      const result = await searchEmbeddings({
        schemaName: values.schemaName,
        text: values.text,
        targetField: values.targetField,
        limit: clampSearchLimit(values.limit),
        filter: values.filter,
      });
      setHits(result.hits);
    } catch (reason) {
      setHits(undefined);
      setError(formatEmbeddingsApiError(reason));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <EmbeddingsReadiness rows={rows} />
      {workersEnabled === false ? (
        <Alert variant="warning">
          <Info className="size-4" />
          <AlertTitle>Workers disabled</AlertTitle>
          <AlertDescription>
            Search still runs.{' '}
            <Link
              href="/embeddings/settings"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Enable workers
            </Link>{' '}
            to process new embeddings.
          </AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Query</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchForm
            configs={configs}
            schemas={schemas}
            schemaName={schemaName}
            configId={configId}
            targetField={selected?.targetField ?? ''}
            rows={rows}
            pending={pending}
            onSchemaChange={next => {
              setSchemaName(next);
              const nextConfig = pickInitialSearchConfig({
                configs,
                indexesBySchema,
                schemaName: next,
              });
              setConfigId(nextConfig?._id ?? '');
            }}
            onConfigChange={next => {
              setConfigId(next);
              const matched = configs.find(config => config._id === next);
              if (matched) setSchemaName(matched.schemaName);
            }}
            onSubmit={runSearch}
          />
        </CardContent>
      </Card>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Search failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {hits ? (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchResults hits={hits} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
