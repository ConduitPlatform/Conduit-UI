'use client';

import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { teamPartitionSubject } from '@/lib/models/embeddings/source';
import { useFormContext } from 'react-hook-form';
import type { EmbeddingSourceFormValues } from './schema';

export type TeamOption = {
  id: string;
  name: string;
};

type ScopePickerProps = {
  teams: TeamOption[];
  disabled?: boolean;
};

export function ScopePicker({ teams, disabled }: ScopePickerProps) {
  const { control } = useFormContext<EmbeddingSourceFormValues>();
  const options = teams.map(team => ({
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
            Documents inherit this team. The scope cannot change after create.
          </FormDescription>
          <FormControl>
            <SearchableCombobox
              id="source-scope"
              value={field.value}
              options={options}
              disabled={disabled || options.length === 0}
              placeholder={
                options.length === 0 ? 'No teams available' : 'Select a team'
              }
              searchPlaceholder="Search teams"
              emptyLabel="No matching teams"
              ariaLabel="Access scope"
              onValueChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
