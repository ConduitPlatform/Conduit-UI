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
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import { formatEmbeddingsApiError } from '@/lib/models/embeddings/errors';
import {
  defaultBackfillBatchSize,
  maxAllowedBatchSize,
  parseBatchSizeInput,
  parseOperatorFilterJson,
} from '@/lib/models/embeddings/backfill-view';

const ALL_CONFIGS = 'all';

type StartBackfillDialogProps = {
  configs: EmbeddingConfig[];
  schemas: string[];
  maxBatchSize?: number;
  defaultSchema?: string;
  defaultConfig?: string;
};

export function StartBackfillDialog({
  configs,
  schemas,
  maxBatchSize,
  defaultSchema,
  defaultConfig,
}: StartBackfillDialogProps) {
  const router = useRouter();
  const allowedMax = maxAllowedBatchSize(maxBatchSize);
  const [open, setOpen] = useState(false);
  const [schemaName, setSchemaName] = useState(defaultSchema ?? '');
  const [configId, setConfigId] = useState(defaultConfig ?? ALL_CONFIGS);
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [batchSize, setBatchSize] = useState(
    String(defaultBackfillBatchSize(maxBatchSize))
  );
  const [filterText, setFilterText] = useState('');
  const [filterError, setFilterError] = useState<string>();
  const [batchError, setBatchError] = useState<string>();
  const [pending, setPending] = useState(false);

  const schemaConfigs = useMemo(
    () =>
      schemaName
        ? configs.filter(config => config.schemaName === schemaName)
        : configs,
    [configs, schemaName]
  );

  const reset = () => {
    const matched = configs.find(config => config._id === defaultConfig);
    setSchemaName(defaultSchema ?? matched?.schemaName ?? '');
    setConfigId(defaultConfig ?? ALL_CONFIGS);
    setOnlyMissing(true);
    setBatchSize(String(defaultBackfillBatchSize(maxBatchSize)));
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

  const disabled = configs.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          title={disabled ? 'Create a config first' : undefined}
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
                {schemas.map(schema => (
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
                const matched = configs.find(config => config._id === value);
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
              onChange={event => {
                setBatchSize(event.target.value);
                setBatchError(undefined);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Default 100. Maximum {allowedMax.toLocaleString()}.
            </p>
            {batchError ? (
              <p className="text-sm text-destructive">{batchError}</p>
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
                onChange={event => {
                  setFilterText(event.target.value);
                  setFilterError(undefined);
                }}
                className="min-h-24 font-mono text-xs"
                placeholder='{"status":"published"}'
              />
              {filterError ? (
                <p className="text-sm text-destructive">{filterError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Must be a JSON object. Leave empty to scan the whole schema.
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
