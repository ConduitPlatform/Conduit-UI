'use client';

import { useMemo, useState } from 'react';
import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getTeams } from '@/lib/api/authentication';
import { teamPartitionSubject } from '@/lib/models/embeddings/source';
import type { TeamOption } from '@/lib/api/embeddings/source-options';
import { useFormContext } from 'react-hook-form';
import type { EmbeddingSourceFormValues } from './schema';

type ScopePickerProps = {
  teams: TeamOption[];
  disabled?: boolean;
  error?: string;
  truncated?: boolean;
  total?: number;
};

export function ScopePicker({
  teams,
  disabled,
  error,
  truncated,
  total,
}: ScopePickerProps) {
  const { control } = useFormContext<EmbeddingSourceFormValues>();
  const [extra, setExtra] = useState<TeamOption[]>([]);
  const merged = useMemo(() => {
    const seen = new Set<string>();
    const next: TeamOption[] = [];
    for (const team of [...teams, ...extra]) {
      if (seen.has(team.id)) continue;
      seen.add(team.id);
      next.push(team);
    }
    return next;
  }, [extra, teams]);
  const options = merged.map(team => ({
    value: teamPartitionSubject(team.id),
    label: team.name,
  }));

  return (
    <FormField
      control={control}
      name="partitionSubject"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel>Access scope</FormLabel>
          <FormDescription>
            Team partition for document access. Storage selectors do not provide
            tenancy. The scope cannot change after create.
          </FormDescription>
          <FormControl>
            <SearchableCombobox
              id="source-scope"
              value={field.value}
              options={options}
              disabled={disabled || Boolean(error)}
              placeholder={error ? 'Teams unavailable' : 'Select a team'}
              searchPlaceholder="Search teams"
              emptyLabel="No matching teams"
              ariaLabel="Access scope"
              onValueChange={field.onChange}
              onSearchChange={query => {
                if (disabled) return;
                const search = query.trim();
                if (!search) return;
                void getTeams(0, 100, { search })
                  .then(result => {
                    setExtra(
                      result.teams.map(team => ({
                        id: team._id,
                        name: team.name,
                      }))
                    );
                  })
                  .catch(() => undefined);
              }}
            />
          </FormControl>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : truncated ? (
            <p className="text-xs text-muted-foreground">
              Showing {merged.length} of {total?.toLocaleString()} teams. Search
              to find others.
            </p>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
