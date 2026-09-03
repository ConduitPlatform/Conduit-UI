'use client';

import * as React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';
import {
  getOperationMeta,
  getOperationBadgeVariant,
} from '@/components/database/queries/query-operations';
import { DeclaredSchema } from '@/lib/models/database';
import { OperationsEnum } from '@/lib/models/database/custom-endpoints';
import { cn } from '@/lib/utils';
import { operationTypes } from './constants';

const FIELD_LABEL = 'pl-0 text-sm font-medium text-foreground';

interface QueryInformationProps {
  contractLocked: boolean;
  modelsLoading: boolean;
  filteredModels: DeclaredSchema[];
  modelSearchTerm: string;
  onModelSearchChange: (value: string) => void;
}

export function QueryInformation({
  contractLocked,
  modelsLoading,
  filteredModels,
  modelSearchTerm,
  onModelSearchChange,
}: QueryInformationProps) {
  const form = useFormContext();
  const operation = Number(form.watch('operation')) as OperationsEnum;
  const operationMeta = getOperationMeta(operation);
  const selectedSchema = form.watch('selectedSchema') as string | undefined;
  const selectedSchemaName = form.watch('selectedSchemaName') as
    | string
    | undefined;
  const isFind = operation === OperationsEnum.GET;
  const [isModelDialogOpen, setIsModelDialogOpen] = React.useState(false);

  const applyOperation = (next: OperationsEnum) => {
    if (contractLocked || next === operation) return;
    form.setValue('operation', next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Information</CardTitle>
        <CardDescription>
          Name, model, and runtime options for this endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <InputField
            label="Query Name"
            fieldName="name"
            placeholder="GetUsersByTeam"
            info="Becomes the Client API path: /database/function/{name}. Spaces are not allowed."
            classNames={{
              label: FIELD_LABEL,
              input: 'font-mono slashed-zero',
            }}
          />

          <TextAreaField
            label="Description"
            fieldName="endpointDescription"
            placeholder="Describe what this query does"
            rows={2}
            classNames={{
              label: FIELD_LABEL,
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="operation"
          render={() => (
            <FormItem className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <FormLabel className="text-sm font-medium">Operation</FormLabel>
                <QueryFieldHint
                  content={
                    contractLocked
                      ? 'The HTTP method is part of the endpoint contract and cannot change after create.'
                      : 'Maps to the HTTP method clients will call on /database/function/{name}.'
                  }
                />
              </div>
              <FormControl>
                <div
                  role="radiogroup"
                  aria-label="Operation"
                  aria-disabled={contractLocked || undefined}
                  className="grid grid-cols-3 gap-1 rounded-lg bg-muted/40 p-1 sm:grid-cols-5"
                  onKeyDown={event => {
                    if (
                      contractLocked ||
                      (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')
                    ) {
                      return;
                    }
                    event.preventDefault();
                    const currentIndex = operationTypes.findIndex(
                      op => op.value === operation
                    );
                    const delta = event.key === 'ArrowRight' ? 1 : -1;
                    const next =
                      operationTypes[
                        (currentIndex + delta + operationTypes.length) %
                          operationTypes.length
                      ];
                    applyOperation(next.value);
                  }}
                >
                  {operationTypes.map(op => {
                    const meta = getOperationMeta(op.value);
                    const isSelected = operation === op.value;
                    return (
                      <button
                        key={op.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-disabled={contractLocked || undefined}
                        disabled={contractLocked}
                        tabIndex={isSelected ? 0 : -1}
                        title={op.description}
                        onClick={() => applyOperation(op.value)}
                        className={cn(
                          'flex h-12 min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md px-1 motion-reduce:transition-none transition-colors',
                          isSelected
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                          contractLocked &&
                            !isSelected &&
                            'cursor-not-allowed opacity-40',
                          contractLocked && isSelected && 'cursor-default',
                          isSelected &&
                            op.value === OperationsEnum.DELETE &&
                            'text-destructive'
                        )}
                      >
                        <span className="truncate text-xs font-medium">
                          {op.label}
                        </span>
                        <span
                          className={cn(
                            'font-mono text-[10px] tabular-nums tracking-wide',
                            isSelected
                              ? 'text-foreground/70'
                              : 'text-muted-foreground',
                            isSelected &&
                              op.value === OperationsEnum.DELETE &&
                              'text-destructive/80'
                          )}
                        >
                          {meta.method}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {operationMeta.description}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Model</span>
            <QueryFieldHint
              content={
                contractLocked
                  ? 'The target schema is locked after create.'
                  : 'The schema this endpoint reads or writes.'
              }
            />
          </div>
          <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={contractLocked}
                aria-label={
                  selectedSchemaName
                    ? `Model: ${selectedSchemaName}`
                    : 'Select a model'
                }
                className={cn(
                  'h-9 w-full justify-between border-0 bg-muted/50 px-3 text-[13px] font-normal shadow-none',
                  'hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/50',
                  !selectedSchemaName && 'text-muted-foreground'
                )}
              >
                <span className="truncate">
                  {selectedSchemaName || 'Select a model'}
                </span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Model</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search models…"
                    value={modelSearchTerm}
                    onChange={event => onModelSearchChange(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="flex flex-col gap-0.5 pr-3">
                    {modelsLoading && (
                      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Loading models…
                      </p>
                    )}
                    {!modelsLoading && filteredModels.length === 0 && (
                      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No models match this operation and search.
                      </p>
                    )}
                    {filteredModels.map(model => {
                      const isSelected = selectedSchema === model._id;
                      return (
                        <Button
                          key={model._id}
                          type="button"
                          variant="ghost"
                          className={cn(
                            'h-9 w-full justify-between px-3 text-left font-normal',
                            isSelected && 'bg-accent'
                          )}
                          onClick={() => {
                            form.setValue('selectedSchema', model._id, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            form.setValue('selectedSchemaName', model.name, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                            setIsModelDialogOpen(false);
                          }}
                        >
                          <span className="truncate">{model.name}</span>
                          {isSelected && (
                            <Check className="size-4 shrink-0 text-foreground" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          {form.formState.errors.selectedSchema && (
            <p className="text-sm text-destructive">
              {String(form.formState.errors.selectedSchema.message)}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border/60">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-3 py-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              Runtime
            </p>
            {isFind && (
              <Badge
                variant={getOperationBadgeVariant(operation)}
                className="font-mono font-normal tabular-nums"
              >
                {operationMeta.method}
              </Badge>
            )}
          </div>
          <div className="divide-y divide-border/60">
            <RuntimeOption
              name="authentication"
              id="query-authentication"
              label="Authentication"
              description="Require a user bearer token"
              hint="When enabled, callers must send a user bearer token. Anonymous Client API requests are rejected."
            />
            {isFind && (
              <>
                <RuntimeOption
                  name="paginated"
                  id="query-paginated"
                  label="Pagination"
                  description="Expose skip, limit, and a document count"
                  hint="Adds skip and limit query parameters and returns a document count with results."
                />
                <RuntimeOption
                  name="sorted"
                  id="query-sorted"
                  label="Sorting"
                  description="Allow clients to pass sort parameters"
                  hint="Allows clients to pass sort query parameters on GET requests."
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RuntimeOption({
  name,
  id,
  label,
  description,
  hint,
}: {
  name: 'authentication' | 'paginated' | 'sorted';
  id: string;
  label: string;
  description: string;
  hint: string;
}) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-4 px-3 py-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <FormLabel htmlFor={id} className="text-sm font-medium">
                {label}
              </FormLabel>
              <QueryFieldHint content={hint} />
            </div>
            <FormDescription className="text-xs">{description}</FormDescription>
          </div>
          <FormControl>
            <Switch
              id={id}
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
