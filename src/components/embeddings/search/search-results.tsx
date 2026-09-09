'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Braces, Table2 } from 'lucide-react';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
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
  isSearchViewMode,
  searchHitLabel,
  SearchViewMode,
} from '@/lib/models/embeddings/search-view';

function jsonViewStyles(base: typeof defaultStyles) {
  return {
    ...base,
    container: `${base.container} semantic-json-view font-mono text-sm`,
    label: `${base.label} semantic-json-view__property`,
    clickableLabel: `${base.clickableLabel} semantic-json-view__property`,
    nullValue: `${base.nullValue} semantic-json-view__null`,
    undefinedValue: `${base.undefinedValue} semantic-json-view__null`,
    stringValue: `${base.stringValue} semantic-json-view__string wrap-break-word`,
    booleanValue: `${base.booleanValue} semantic-json-view__boolean`,
    numberValue: `${base.numberValue} semantic-json-view__number font-medium`,
    otherValue: `${base.otherValue} semantic-json-view__value`,
    punctuation: `${base.punctuation} semantic-json-view__punctuation`,
    expandIcon: `${base.expandIcon} semantic-json-view__control`,
    collapseIcon: `${base.collapseIcon} semantic-json-view__control`,
    collapsedContent: `${base.collapsedContent} semantic-json-view__collapsed`,
  };
}

type SearchResultsProps = {
  hits: SemanticSearchHit[];
};

export function SearchResults({ hits }: SearchResultsProps) {
  const { resolvedTheme } = useTheme();
  const [view, setView] = useState<SearchViewMode>('table');
  const columns = useMemo(() => documentColumnKeys(hits), [hits]);
  const jsonStyles = jsonViewStyles(
    resolvedTheme === 'dark' ? darkStyles : defaultStyles
  );

  return (
    <section aria-live="polite" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {`${hits.length.toLocaleString()} result${hits.length === 1 ? '' : 's'}. Higher score is better.`}
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
      {hits.length === 0 ? null : view === 'json' ? (
        <div className="overflow-auto rounded-md border border-border/60 bg-surface-2 p-3">
          <JsonView
            data={hits}
            shouldExpandNode={level => level < 2}
            style={jsonStyles}
          />
        </div>
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
            {hits.map((hit, index) => (
              <TableRow
                key={`${index}-${hit.score}`}
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
