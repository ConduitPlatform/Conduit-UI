'use client';

import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface QueryModelField {
  name: string;
  type: string;
  isArray: boolean;
}

export const COMPACT_SELECT_TRIGGER =
  'h-8 border-0 bg-muted/50 px-3 text-[13px] font-normal shadow-none focus:ring-1 focus:ring-primary/50 focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:flex [&>span]:items-center';

export function compactFieldLabel(hideOnDesktop?: boolean) {
  return cn(
    'pl-0 text-xs font-medium text-muted-foreground',
    hideOnDesktop && 'sm:sr-only'
  );
}

export function QueryEnumSelect({
  name,
  label,
  options,
  hideLabelOnDesktop,
  onValueChange,
}: {
  name: string;
  label: string;
  options: ReadonlyArray<{ value: number; label: string }>;
  hideLabelOnDesktop?: boolean;
  onValueChange?: (value: number) => void;
}) {
  const form = useFormContext();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem
          className={cn(
            'min-w-0 space-y-1.5',
            hideLabelOnDesktop && 'sm:space-y-0'
          )}
        >
          <FormLabel className={compactFieldLabel(hideLabelOnDesktop)}>
            {label}
          </FormLabel>
          <Select
            value={String(field.value ?? options[0]?.value ?? 0)}
            onValueChange={val => {
              const next = Number(val);
              field.onChange(next);
              onValueChange?.(next);
            }}
          >
            <FormControl>
              <SelectTrigger className={COMPACT_SELECT_TRIGGER}>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function QueryCollapsibleRow({
  open,
  onOpenChange,
  summary,
  isIncomplete,
  collapsedBadges,
  removeLabel,
  removeTooltip,
  onRemove,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
  isIncomplete: boolean;
  collapsedBadges?: React.ReactNode;
  removeLabel: string;
  removeTooltip: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'overflow-hidden rounded-lg border border-border/60 bg-card',
        isIncomplete && 'border-dashed border-primary/40'
      )}
    >
      <div className="flex items-center gap-1 bg-muted/40 pr-1">
        <CollapsibleTrigger className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground motion-reduce:transition-none transition-transform',
              open && 'rotate-180'
            )}
          />
          <span className="min-w-0 truncate font-mono text-sm font-medium slashed-zero">
            {summary}
          </span>
          {!open && collapsedBadges}
        </CollapsibleTrigger>
        <QueryRowRemoveButton
          label={removeLabel}
          tooltip={removeTooltip}
          onRemove={onRemove}
        />
      </div>
      <CollapsibleContent>
        <div className="border-t border-border/60">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function QueryRowRemoveButton({
  label,
  tooltip,
  onRemove,
}: {
  label: string;
  tooltip: string;
  onRemove: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            className="size-8 shrink-0"
            onClick={onRemove}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
