'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SearchFilterFields } from '@/components/embeddings/search/search-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import { ReadinessRow } from '@/lib/models/embeddings/readiness';
import {
  DEFAULT_SEARCH_LIMIT,
  isSearchReady,
  MAX_SEARCH_LIMIT,
  MIN_SEARCH_LIMIT,
  parseSearchFilter,
  parseSearchLimit,
  searchBlockAction,
} from '@/lib/models/embeddings/search-view';

type SearchFormValues = {
  schemaName: string;
  configId: string;
  targetField: string;
  text: string;
  limit: number;
  filter?: Record<string, unknown>;
};

type SearchFormProps = {
  configs: EmbeddingConfig[];
  schemas: string[];
  schemaName: string;
  configId: string;
  targetField: string;
  rows: ReadinessRow[];
  pending: boolean;
  onSchemaChange: (schemaName: string) => void;
  onConfigChange: (configId: string) => void;
  onSubmit: (values: SearchFormValues) => void;
};

export function SearchForm({
  configs,
  schemas,
  schemaName,
  configId,
  targetField,
  rows,
  pending,
  onSchemaChange,
  onConfigChange,
  onSubmit,
}: SearchFormProps) {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(String(DEFAULT_SEARCH_LIMIT));
  const [filterText, setFilterText] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [limitError, setLimitError] = useState<string>();
  const [filterError, setFilterError] = useState<string>();
  const block = searchBlockAction(rows);
  const blocked = !isSearchReady(rows);
  const schemaConfigs = useMemo(
    () =>
      schemaName
        ? configs.filter(config => config.schemaName === schemaName)
        : configs,
    [configs, schemaName]
  );

  const submit = () => {
    const parsedLimit = parseSearchLimit(limit);
    const parsedFilter = parseSearchFilter(filterText);
    setLimitError(parsedLimit.ok ? undefined : parsedLimit.error);
    setFilterError(parsedFilter.ok ? undefined : parsedFilter.error);
    if (!parsedLimit.ok || !parsedFilter.ok) return;
    if (blocked || pending || !schemaName || !configId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit({
      schemaName,
      configId,
      targetField,
      text: trimmed,
      limit: parsedLimit.limit,
      filter: parsedFilter.filter,
    });
  };

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        submit();
      }}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="search-schema">Schema</Label>
          <Select
            value={schemaName || undefined}
            onValueChange={onSchemaChange}
            disabled={schemas.length === 0}
          >
            <SelectTrigger id="search-schema" className="h-8 min-h-8">
              <SelectValue placeholder="Select a schema" />
            </SelectTrigger>
            <SelectContent>
              {schemas.map(schema => (
                <SelectItem key={schema} value={schema}>
                  {schema}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="search-config">Config</Label>
          <Select
            value={configId || undefined}
            onValueChange={onConfigChange}
            disabled={schemaConfigs.length === 0}
          >
            <SelectTrigger id="search-config" className="h-8 min-h-8">
              <SelectValue placeholder="Select a config" />
            </SelectTrigger>
            <SelectContent>
              {schemaConfigs.map(item => (
                <SelectItem key={item._id} value={item._id}>
                  {item.schemaName} · {item.targetField}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="search-target">Target field</Label>
        <Input
          id="search-target"
          value={targetField}
          disabled
          className="font-mono"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="search-text">Query</Label>
        <Textarea
          id="search-text"
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={event => {
            if (event.key !== 'Enter' || event.shiftKey) return;
            if (event.nativeEvent.isComposing) return;
            event.preventDefault();
            submit();
          }}
          className="min-h-20"
          autoComplete="off"
        />
      </div>
      <div className="max-w-40 space-y-1.5">
        <Label htmlFor="search-limit">Results</Label>
        <Input
          id="search-limit"
          type="number"
          inputMode="numeric"
          min={MIN_SEARCH_LIMIT}
          max={MAX_SEARCH_LIMIT}
          step={1}
          value={limit}
          aria-invalid={Boolean(limitError)}
          onChange={event => {
            setLimit(event.target.value);
            setLimitError(undefined);
          }}
        />
        {limitError ? (
          <p className="text-sm text-destructive">{limitError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Maximum {MAX_SEARCH_LIMIT}.
          </p>
        )}
      </div>
      <SearchFilterFields
        open={filterOpen}
        onOpenChange={setFilterOpen}
        value={filterText}
        error={filterError}
        onChange={next => {
          setFilterText(next);
          setFilterError(undefined);
        }}
      />
      <div className="flex min-h-8 flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={
            blocked || pending || !schemaName || !configId || !text.trim()
          }
        >
          {pending ? 'Searching…' : 'Search'}
        </Button>
        {block?.href && block.actionLabel ? (
          <Link
            href={block.href}
            className={cn(
              'inline-flex min-h-8 items-center rounded-md px-2 text-[13px] font-medium text-primary underline-offset-4 hover:underline',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            {block.actionLabel}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
