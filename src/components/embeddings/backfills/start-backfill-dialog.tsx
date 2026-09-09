'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { startBackfill } from '@/lib/api/embeddings';
import { toast } from '@/lib/hooks/use-toast';
import { EmbeddingConfigOption } from '@/lib/models/embeddings/config';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import {
  defaultBackfillBatchSize,
  maxAllowedBatchSize,
  parseBatchSizeInput,
  parseOperatorFilterJson,
  startBackfillConfigs,
  startBackfillSchemas,
} from '@/lib/models/embeddings/backfill-view';

const ALL_CONFIGS = 'all';

type StartBackfillDialogProps = {
  configs: EmbeddingConfigOption[];
  maxBatchSize?: number;
  defaultSchema?: string;
  defaultConfig?: string;
};

function startBackfillFormDefaults(
  configs: EmbeddingConfigOption[],
  maxBatchSize?: number,
  defaultSchema?: string,
  defaultConfig?: string
) {
  const enabledConfigs = startBackfillConfigs(configs);
  const schemaOptions = startBackfillSchemas(configs);
  const matched = enabledConfigs.find(config => config._id === defaultConfig);
  return {
    enabledConfigs,
    schemaOptions,
    schemaName:
      defaultSchema && schemaOptions.includes(defaultSchema)
        ? defaultSchema
        : (matched?.schemaName ?? ''),
    configId: matched?._id ?? ALL_CONFIGS,
    batchSize: String(defaultBackfillBatchSize(maxBatchSize)),
  };
}

export function StartBackfillDialog({
  configs,
  maxBatchSize,
  defaultSchema,
  defaultConfig,
}: StartBackfillDialogProps) {
  const router = useRouter();
  const allowedMax = maxAllowedBatchSize(maxBatchSize);
  const defaults = useMemo(
    () =>
      startBackfillFormDefaults(
        configs,
        maxBatchSize,
        defaultSchema,
        defaultConfig
      ),
    [configs, maxBatchSize, defaultSchema, defaultConfig]
  );
  const { enabledConfigs, schemaOptions } = defaults;
  const [open, setOpen] = useState(false);
  const [schemaName, setSchemaName] = useState(defaults.schemaName);
  const [configId, setConfigId] = useState(defaults.configId);
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [batchSize, setBatchSize] = useState(defaults.batchSize);
  const [filterText, setFilterText] = useState('');
  const [filterError, setFilterError] = useState<string>();
  const [batchError, setBatchError] = useState<string>();
  const [pending, setPending] = useState(false);

  const schemaConfigs = useMemo(
    () => startBackfillConfigs(configs, schemaName || undefined),
    [configs, schemaName]
  );

  const reset = () => {
    const next = startBackfillFormDefaults(
      configs,
      maxBatchSize,
      defaultSchema,
      defaultConfig
    );
    setSchemaName(next.schemaName);
    setConfigId(next.configId);
    setOnlyMissing(true);
    setBatchSize(next.batchSize);
    setFilterText('');
    setFilterError(undefined);
    setBatchError(undefined);
  };

  const submit = async () => {
    const batch = parseBatchSizeInput(batchSize, maxBatchSize);
    const filter = parseOperatorFilterJson(filterText);
    setBatchError(batch.ok ? undefined : batch.error);
    setFilterError(filter.ok ? undefined : filter.error);
    if (!schemaName) return;
    if (!batch.ok || !filter.ok) return;
    setPending(true);
    try {
      const result = await startBackfill({
        schemaName,
        batchSize: batch.batchSize,
        onlyMissing,
        configId: configId === ALL_CONFIGS ? undefined : configId,
        filter: filter.filter,
      });
      toast({
        title: 'Backfill queued',
        description:
          result.warnings.length > 0
            ? result.warnings.join(' ')
            : `${result.queued.toLocaleString()} run${result.queued === 1 ? '' : 's'} queued`,
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Could not start backfill',
        description: formatEmbeddingsApiError(error),
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  const disabled = enabledConfigs.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (pending && !next) return;
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          title={disabled ? 'Enable a config first' : undefined}
        >
          Start backfill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={event => {
            event.preventDefault();
            void submit();
          }}
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>Start backfill</DialogTitle>
            <DialogDescription>
              Queue embedding generation for documents in a schema. Progress is
              of queued documents, not the full collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="start-schema">Schema</Label>
            <Select
              value={schemaName || undefined}
              onValueChange={value => {
                setSchemaName(value);
                setConfigId(ALL_CONFIGS);
              }}
            >
              <SelectTrigger id="start-schema" className="h-8 min-h-8">
                <SelectValue placeholder="Select a schema" />
              </SelectTrigger>
              <SelectContent>
                {schemaOptions.map(schema => (
                  <SelectItem key={schema} value={schema}>
                    {schema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start-config">Config</Label>
            <Select
              value={configId}
              onValueChange={value => {
                setConfigId(value);
                if (value === ALL_CONFIGS) return;
                const matched = enabledConfigs.find(
                  config => config._id === value
                );
                if (matched) setSchemaName(matched.schemaName);
              }}
            >
              <SelectTrigger id="start-config" className="h-8 min-h-8">
                <SelectValue placeholder="All enabled configs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CONFIGS}>All enabled configs</SelectItem>
                {schemaConfigs.map(config => (
                  <SelectItem key={config._id} value={config._id}>
                    {config.schemaName} · {config.targetField}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start-batch">Batch size</Label>
            <Input
              id="start-batch"
              type="number"
              inputMode="numeric"
              min={1}
              max={allowedMax}
              step={1}
              value={batchSize}
              aria-invalid={Boolean(batchError)}
              aria-describedby={
                batchError ? 'start-batch-error' : 'start-batch-help'
              }
              onChange={event => {
                setBatchSize(event.target.value);
                setBatchError(undefined);
              }}
            />
            <p id="start-batch-help" className="text-xs text-muted-foreground">
              {`Default 100. Maximum ${allowedMax.toLocaleString()}.`}
            </p>
            {batchError ? (
              <p
                id="start-batch-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {batchError}
              </p>
            ) : null}
          </div>
          <label className="flex min-h-8 items-center gap-2 text-sm">
            <Switch
              checked={onlyMissing}
              onCheckedChange={setOnlyMissing}
              aria-label="Only documents missing embeddings"
            />
            Only documents missing embeddings
          </label>
          <Collapsible>
            <CollapsibleTrigger
              type="button"
              className="flex min-h-8 w-full items-center justify-between rounded-md px-1 text-left text-sm font-medium hover:bg-accent/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180"
            >
              Advanced filter
              <ChevronDown
                aria-hidden
                className="size-4 text-muted-foreground"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 pt-2">
              <Label htmlFor="start-filter">Filter JSON</Label>
              <Textarea
                id="start-filter"
                value={filterText}
                aria-invalid={Boolean(filterError)}
                aria-describedby={
                  filterError ? 'start-filter-error' : 'start-filter-help'
                }
                onChange={event => {
                  setFilterText(event.target.value);
                  setFilterError(undefined);
                }}
                className="min-h-24 font-mono text-xs"
                placeholder='{"status":"published"}'
              />
              {filterError ? (
                <p
                  id="start-filter-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {filterError}
                </p>
              ) : (
                <p
                  id="start-filter-help"
                  className="text-xs text-muted-foreground"
                >
                  Equality, comparisons, bounded $in/$nin, and $and only. Leave
                  empty to scan the whole schema.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !schemaName}>
              {pending ? 'Starting…' : 'Start backfill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
