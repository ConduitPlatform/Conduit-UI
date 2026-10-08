'use client';

import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SearchFilterFieldsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SearchFilterFields({
  open,
  onOpenChange,
  value,
  error,
  onChange,
}: SearchFilterFieldsProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      onKeyDown={event => {
        if (event.key !== 'Escape' || !open) return;
        event.stopPropagation();
        onOpenChange(false);
      }}
    >
      <CollapsibleTrigger
        type="button"
        className="flex min-h-8 w-full items-center justify-between rounded-md px-1 text-left text-sm font-medium hover:bg-accent/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180"
      >
        Filter JSON
        <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1.5 pt-2">
        <Label htmlFor="search-filter">Filter</Label>
        <Textarea
          id="search-filter"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? 'search-filter-error' : 'search-filter-help'
          }
          onChange={event => onChange(event.target.value)}
          className="min-h-24 font-mono text-xs"
          placeholder='{"status":"published"}'
        />
        {error ? (
          <p
            id="search-filter-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        ) : (
          <p id="search-filter-help" className="text-xs text-muted-foreground">
            Equality, comparisons, bounded $in/$nin, and $and only. Leave empty
            to search the whole schema.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
