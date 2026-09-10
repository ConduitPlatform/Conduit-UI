'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import { SearchFilterFields } from '@/components/embeddings/search/search-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ReadinessRow } from '@/lib/models/embeddings/readiness';
import {
  DEFAULT_SEARCH_LIMIT,
  isSearchReady,
  MAX_SEARCH_LIMIT,
  MIN_SEARCH_LIMIT,
  parseSearchFilter,
  parseSearchLimit,
  searchBlockAction,
  type SearchTarget,
} from '@/lib/models/embeddings/search-view';
import { sourceKindLabel } from '@/lib/models/embeddings/source';

export type SearchFormValues = {
  schemaName?: string;
  sourceId?: string;
  configId: string;
  targetField: string;
  text: string;
  limit: number;
  filter?: Record<string, unknown>;
};

type SearchFormProps = {
  targets: SearchTarget[];
  targetId: string;
  schemaName: string;
  configId: string;
  targetField: string;
  rows: ReadinessRow[];
  pending: boolean;
  onTargetChange: (targetId: string) => void;
  onSubmit: (values: SearchFormValues) => void;
};

export function SearchForm({
  targets,
  targetId,
  schemaName,
  configId,
  targetField,
  rows,
  pending,
  onTargetChange,
  onSubmit,
}: SearchFormProps) {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(String(DEFAULT_SEARCH_LIMIT));
  const [filterText, setFilterText] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [limitError, setLimitError] = useState<string>();
  const [filterError, setFilterError] = useState<string>();
  const selected = targets.find(target => target.id === targetId);
  const schemaTarget = selected?.type === 'schema';
  const sourceReady = selected?.type === 'source' ? selected.ready : false;
  const block = schemaTarget ? searchBlockAction(rows) : undefined;
  const blocked = schemaTarget ? !isSearchReady(rows) : !sourceReady;
  const options = useMemo(
    () =>
      targets.map(target => ({
        value: target.id,
        label:
          target.type === 'schema'
            ? `Schema · ${target.label}`
            : `${sourceKindLabel(target.kind)} · ${target.label}`,
      })),
    [targets]
  );

  const submit = () => {
    const parsedLimit = parseSearchLimit(limit);
    const parsedFilter = schemaTarget
      ? parseSearchFilter(filterText)
      : { ok: true as const, filter: undefined };
    setLimitError(parsedLimit.ok ? undefined : parsedLimit.error);
    setFilterError(parsedFilter.ok ? undefined : parsedFilter.error);
    if (!parsedLimit.ok || !parsedFilter.ok) return;
    if (blocked || pending || !selected) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit({
      schemaName: selected.type === 'schema' ? selected.schemaName : undefined,
      sourceId: selected.type === 'source' ? selected.sourceId : undefined,
      configId: selected.type === 'schema' ? selected.configId : '',
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
      <div className="space-y-1.5">
        <Label htmlFor="search-target-source">Source</Label>
        <SearchableCombobox
          id="search-target-source"
          value={targetId}
          options={options}
          disabled={options.length === 0}
          placeholder="Select a config or source"
          searchPlaceholder="Search configs and sources"
          emptyLabel="No matching sources"
          ariaLabel="Search source"
          onValueChange={onTargetChange}
        />
      </div>
      {schemaTarget ? (
        <div className="space-y-1.5">
          <Label htmlFor="search-target">Target field</Label>
          <Input
            id="search-target"
            value={targetField}
            disabled
            className="font-mono disabled:bg-muted disabled:text-foreground disabled:opacity-100"
          />
        </div>
      ) : null}
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
          aria-describedby={
            limitError ? 'search-limit-error' : 'search-limit-help'
          }
          onChange={event => {
            setLimit(event.target.value);
            setLimitError(undefined);
          }}
        />
        {limitError ? (
          <p
            id="search-limit-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {limitError}
          </p>
        ) : (
          <p id="search-limit-help" className="text-xs text-muted-foreground">
            {`Maximum ${MAX_SEARCH_LIMIT} results.`}
          </p>
        )}
      </div>
      {schemaTarget ? (
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
      ) : (
        <p className="text-xs text-muted-foreground text-pretty">
          Admin Test Search is operator-wide. It does not send a Client scope
          and does not exercise Client ReBAC.
        </p>
      )}
      <div className="flex min-h-8 flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={
            blocked ||
            pending ||
            !selected ||
            !text.trim() ||
            (schemaTarget && (!schemaName || !configId))
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
