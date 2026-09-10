'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import type { EmbeddingSourceFormValues } from './schema';

type MetadataAllowlistFieldProps = {
  disabled?: boolean;
};

export function MetadataAllowlistField({
  disabled,
}: MetadataAllowlistFieldProps) {
  const { control } = useFormContext<EmbeddingSourceFormValues>();
  return (
    <FormField
      control={control}
      name="metadataAllowlist"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel>Metadata allowlist</FormLabel>
          <FormDescription>
            Optional. One field per line. Search returns only these metadata
            keys.
          </FormDescription>
          <FormControl>
            <Textarea
              id="source-metadata-allowlist"
              value={field.value ?? ''}
              disabled={disabled}
              className="min-h-20 font-mono text-sm"
              placeholder="tag"
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
