'use client';

import { useState } from 'react';
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
import { EmbeddingConfigOption } from '@/lib/models/embeddings/config';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import { ReadinessRow } from '@/lib/models/embeddings/readiness';
import { SemanticSearchHit } from '@/lib/models/embeddings/search';
import {
  clampSearchLimit,
  type SearchTarget,
} from '@/lib/models/embeddings/search-view';

type TestSearchProps = {
  configs: EmbeddingConfigOption[];
  targets: SearchTarget[];
  fallbackRows: ReadinessRow[];
  readinessByConfigId: Record<string, ReadinessRow[]>;
  workersEnabled?: boolean;
  initialTargetId?: string;
};

export function TestSearch({
  configs,
  targets,
  fallbackRows,
  readinessByConfigId,
  workersEnabled,
  initialTargetId,
}: TestSearchProps) {
  const [targetId, setTargetId] = useState(initialTargetId ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [hits, setHits] = useState<SemanticSearchHit[]>();
  const selected = targets.find(target => target.id === targetId);
  const configId = selected?.type === 'schema' ? selected.configId : '';
  const schemaName = selected?.type === 'schema' ? selected.schemaName : '';
  const config = configs.find(item => item._id === configId);
  const rows = configId
    ? (readinessByConfigId[configId] ?? fallbackRows)
    : fallbackRows;

  const runSearch = async (values: SearchFormValues) => {
    setPending(true);
    setError(undefined);
    try {
      const result = await searchEmbeddings({
        schemaName: values.schemaName,
        sourceId: values.sourceId,
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
      {selected?.type === 'schema' ? <EmbeddingsReadiness rows={rows} /> : null}
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
      {selected?.type === 'source' && !selected.ready ? (
        <Alert variant="warning">
          <Info className="size-4" />
          <AlertTitle>Source is not searchable</AlertTitle>
          <AlertDescription>
            Ready sources can be queried. Disable, revoke, or pending index
            states fail closed.
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
            targets={targets}
            targetId={targetId}
            schemaName={schemaName}
            configId={configId}
            targetField={config?.targetField ?? ''}
            rows={rows}
            pending={pending}
            onTargetChange={setTargetId}
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
            <SearchResults
              hits={hits}
              sourceFields={
                selected?.type === 'schema' ? config?.sourceFields : undefined
              }
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
