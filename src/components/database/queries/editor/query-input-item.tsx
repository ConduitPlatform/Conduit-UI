'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown, Trash2 } from 'lucide-react';
import {
  LocationEnum,
  OperationsEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';
import { inputTypes, placementTypes } from './constants';
import {
  getPlacementExample,
  getPlacementIcon,
  getPlacementName,
  toLocation,
} from './utils';
import { cn } from '@/lib/utils';

interface QueryInputItemProps {
  index: number;
  operation: OperationsEnum;
  onRemove: () => void;
}

const BODY_DISALLOWED_OPERATIONS = [OperationsEnum.GET, OperationsEnum.DELETE];

export function QueryInputItem({
  index,
  operation,
  onRemove,
}: QueryInputItemProps) {
  const form = useFormContext();
  const name = (form.watch(`inputs.${index}.name`) as string) ?? '';
  const type = form.watch(`inputs.${index}.type`) as ValueTypeEnum;
  const location = toLocation(form.watch(`inputs.${index}.location`));
  const optional = Boolean(form.watch(`inputs.${index}.optional`));
  const isArray = Boolean(form.watch(`inputs.${index}.array`));
  const [open, setOpen] = React.useState(!name);
  const isPath = location === LocationEnum.URL;
  const bodyAllowed = !BODY_DISALLOWED_OPERATIONS.includes(operation);

  const applyLocation = (next: LocationEnum) => {
    form.setValue(`inputs.${index}.location`, next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    if (next === LocationEnum.URL) {
      form.setValue(`inputs.${index}.optional`, false, { shouldDirty: true });
      form.setValue(`inputs.${index}.array`, false, { shouldDirty: true });
    }
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-border/60 bg-card"
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
            {name || `Input #${index + 1}`}
          </span>
          {!open && name && (
            <span className="ml-auto flex min-w-0 items-center gap-1.5">
              <Badge
                variant="outline"
                className="max-w-24 truncate font-normal tabular-nums"
              >
                {type}
                {isArray ? '[]' : ''}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {getPlacementName(location)}
              </Badge>
              {optional && (
                <Badge variant="outline" className="font-normal">
                  Optional
                </Badge>
              )}
            </span>
          )}
        </CollapsibleTrigger>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove input ${name || index + 1}`}
                onClick={onRemove}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Remove this input from the draft. Save to persist.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CollapsibleContent>
        <div className="space-y-4 border-t border-border/60 p-4">
          <InputField
            label="Name"
            fieldName={`inputs.${index}.name`}
            placeholder="e.g. id, name, filter"
            classNames={{
              label: 'pl-0 text-sm font-medium text-foreground',
              input: 'font-mono text-sm slashed-zero',
            }}
          />

          <SelectField
            label="Type"
            fieldName={`inputs.${index}.type`}
            placeholder="Select type"
            classNames={{
              selectTrigger:
                'h-9 [&>span]:line-clamp-1 [&>span]:flex [&>span]:items-center',
            }}
            options={inputTypes.map(inputType => ({
              value: inputType.value,
              label: inputType.label,
            }))}
          />

          <FormField
            control={form.control}
            name={`inputs.${index}.location`}
            render={({ field }) => {
              const selected = toLocation(field.value);
              const enabledPlacements = placementTypes.filter(
                place => place.value !== LocationEnum.BODY || bodyAllowed
              );

              return (
                <FormItem className="space-y-1.5">
                  <FormLabel>Placement</FormLabel>
                  <FormControl>
                    <div
                      role="radiogroup"
                      aria-label="Parameter placement"
                      className="grid grid-cols-3 gap-1 rounded-lg border border-input bg-muted/40 p-1"
                      onKeyDown={event => {
                        if (
                          event.key !== 'ArrowRight' &&
                          event.key !== 'ArrowLeft'
                        ) {
                          return;
                        }
                        event.preventDefault();
                        const currentIndex = enabledPlacements.findIndex(
                          place => place.value === selected
                        );
                        const delta = event.key === 'ArrowRight' ? 1 : -1;
                        const next =
                          enabledPlacements[
                            (currentIndex + delta + enabledPlacements.length) %
                              enabledPlacements.length
                          ];
                        applyLocation(next.value);
                      }}
                    >
                      {placementTypes.map(place => {
                        const disabled =
                          place.value === LocationEnum.BODY && !bodyAllowed;
                        const isSelected = selected === place.value;
                        return (
                          <button
                            key={place.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-disabled={disabled || undefined}
                            disabled={disabled}
                            tabIndex={isSelected ? 0 : -1}
                            title={
                              disabled
                                ? 'Body is not available for Find or Delete'
                                : place.description
                            }
                            onClick={() => applyLocation(place.value)}
                            className={cn(
                              'flex h-8 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-1 text-xs font-medium motion-reduce:transition-none transition-colors',
                              isSelected
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground',
                              disabled && 'cursor-not-allowed opacity-40'
                            )}
                          >
                            {getPlacementIcon(place.value, 'size-3.5 shrink-0')}
                            <span className="truncate">
                              {getPlacementName(place.value)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <p className="font-mono text-xs text-muted-foreground slashed-zero">
                    {getPlacementExample(selected, name)}
                  </p>
                  {!bodyAllowed && selected === LocationEnum.BODY && (
                    <p className="text-xs text-destructive">
                      Body parameters are not allowed for Find/Delete operations
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <FormField
              control={form.control}
              name={`inputs.${index}.optional`}
              render={({ field }) => (
                <FormItem className="flex min-h-8 flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id={`inputs.${index}.optional`}
                      checked={Boolean(field.value)}
                      disabled={isPath}
                      onCheckedChange={checked =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <div className="flex items-center gap-1">
                    <FormLabel
                      htmlFor={`inputs.${index}.optional`}
                      className="font-normal"
                    >
                      Optional
                    </FormLabel>
                    <QueryFieldHint content="Path parameters cannot be optional. Query and body inputs can be omitted by the client." />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`inputs.${index}.array`}
              render={({ field }) => (
                <FormItem className="flex min-h-8 flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id={`inputs.${index}.array`}
                      checked={Boolean(field.value)}
                      disabled={isPath}
                      onCheckedChange={checked =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <div className="flex items-center gap-1">
                    <FormLabel
                      htmlFor={`inputs.${index}.array`}
                      className="font-normal"
                    >
                      Array
                    </FormLabel>
                    <QueryFieldHint content="Accept multiple values. Path parameters cannot be arrays." />
                  </div>
                </FormItem>
              )}
            />
          </div>
          {isPath && (
            <p className="text-xs text-muted-foreground">
              Path parameters are required URL segments, so they cannot be
              optional or arrays.
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
