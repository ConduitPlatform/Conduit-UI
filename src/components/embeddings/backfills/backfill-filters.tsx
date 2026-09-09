'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BACKFILL_RUN_STATES } from '@/lib/models/embeddings/backfill';
import { EmbeddingConfig } from '@/lib/models/embeddings/config';
import {
  backfillStateLabel,
  BackfillListUrlState,
} from '@/lib/models/embeddings/backfill-view';

const ALL = 'all';

type BackfillFiltersProps = {
  query: BackfillListUrlState;
  schemas: string[];
  configs: EmbeddingConfig[];
};

function FilterSelect({
  id,
  label,
  value,
  placeholder,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="min-w-40 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-8 min-h-8">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BackfillFilters({
  query,
  schemas,
  configs,
}: BackfillFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const schemaConfigs = query.schema
    ? configs.filter(config => config.schemaName === query.schema)
    : configs;
  const configOptions = schemaConfigs.map(config => ({
    value: config._id,
    label: `${config.schemaName} · ${config.targetField}`,
  }));
  if (
    query.config &&
    !configOptions.some(option => option.value === query.config)
  ) {
    configOptions.unshift({ value: query.config, label: query.config });
  }

  const setFilter = (key: 'schema' | 'config' | 'state', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete(key);
    else params.set(key, value);
    if (key === 'schema') {
      const selected = params.get('config');
      const match = configs.find(config => config._id === selected);
      if (match && value !== ALL && match.schemaName !== value) {
        params.delete('config');
      }
    }
    params.delete('skip');
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        id="backfill-schema"
        label="Schema"
        value={query.schema ?? ALL}
        placeholder="All schemas"
        onChange={value => setFilter('schema', value)}
        options={schemas.map(schema => ({ value: schema, label: schema }))}
      />
      <FilterSelect
        id="backfill-config"
        label="Config"
        value={query.config ?? ALL}
        placeholder="All configs"
        onChange={value => setFilter('config', value)}
        options={configOptions}
      />
      <FilterSelect
        id="backfill-state"
        label="State"
        value={query.state ?? ALL}
        placeholder="All states"
        onChange={value => setFilter('state', value)}
        options={BACKFILL_RUN_STATES.map(state => ({
          value: state,
          label: backfillStateLabel(state),
        }))}
      />
    </div>
  );
}
