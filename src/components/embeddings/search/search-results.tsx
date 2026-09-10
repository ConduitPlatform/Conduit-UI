'use client';

import { lazy, Suspense, useMemo, useState } from 'react';
import { Braces, Table2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCellDisplayValue } from '@/lib/database/format-display-value';
import { SemanticSearchHit } from '@/lib/models/embeddings/search';
import {
  documentColumnKeys,
  formatSearchScore,
  isGenericSearchDocument,
  isSearchViewMode,
  sanitizeSearchHits,
  searchHitKey,
  searchHitLabel,
  SearchViewMode,
} from '@/lib/models/embeddings/search-view';
import { GENERIC_SEARCH_SAFE_FIELDS } from '@/lib/models/embeddings/source';

const SearchJsonView = lazy(() =>
  import('./search-json-view').then(module => ({
    default: module.SearchJsonView,
  }))
);

type SearchResultsProps = {
  hits: SemanticSearchHit[];
  sourceFields?: readonly string[];
};

export function SearchResults({ hits, sourceFields }: SearchResultsProps) {
  const [view, setView] = useState<SearchViewMode>('table');
  const displayHits = useMemo(
    () => sanitizeSearchHits(hits, sourceFields),
    [hits, sourceFields]
  );
  const columns = useMemo(() => {
    const generic = displayHits.some(hit =>
      isGenericSearchDocument(hit.document)
    );
    return documentColumnKeys(
      displayHits,
      generic ? GENERIC_SEARCH_SAFE_FIELDS.length : undefined,
      sourceFields
    );
  }, [displayHits, sourceFields]);

  return (
    <section aria-live="polite" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {displayHits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {`${displayHits.length.toLocaleString()} result${displayHits.length === 1 ? '' : 's'}. Higher score is better.`}
            </p>
            <Tabs
              value={view}
              onValueChange={value => {
                if (isSearchViewMode(value)) setView(value);
              }}
            >
              <TabsList className="h-8" aria-label="View mode">
                <TabsTrigger value="table" className="gap-1.5 px-2.5 text-xs">
                  <Table2 className="size-3.5" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="json" className="gap-1.5 px-2.5 text-xs">
                  <Braces className="size-3.5" />
                  JSON
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}
      </div>
      {displayHits.length === 0 ? null : view === 'json' ? (
        <Suspense
          fallback={
            <div className="overflow-auto rounded-md border border-border/60 bg-surface-2 p-3">
              <p className="text-sm text-muted-foreground">Loading JSON…</p>
            </div>
          }
        >
          <SearchJsonView hits={displayHits} />
        </Suspense>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Metric</TableHead>
              {columns.map(column => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayHits.map((hit, index) => (
              <TableRow
                key={searchHitKey(hit, index)}
                aria-label={searchHitLabel(index, hit)}
              >
                <TableCell className="tabular-nums text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatSearchScore(hit.score)}
                </TableCell>
                <TableCell>{hit.provider ?? '—'}</TableCell>
                <TableCell className="tabular-nums">
                  {hit.distance == null ? '—' : formatSearchScore(hit.distance)}
                </TableCell>
                <TableCell>{hit.metric ?? '—'}</TableCell>
                {columns.map(column => (
                  <TableCell key={column}>
                    <div className="max-w-48 truncate">
                      {formatCellDisplayValue(hit.document[column])}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
