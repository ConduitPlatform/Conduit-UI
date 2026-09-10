'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AUTOMATIC_STORAGE_MIME_TYPES } from '@/lib/models/embeddings/source';
import { useFormContext } from 'react-hook-form';
import type { EmbeddingSourceFormValues } from './schema';

const MIME_LABELS: Record<
  (typeof AUTOMATIC_STORAGE_MIME_TYPES)[number],
  string
> = {
  'text/plain': 'Plain text',
  'text/markdown': 'Markdown',
  'application/json': 'JSON',
  'text/csv': 'CSV',
  'application/pdf': 'PDF',
};

type MimeAllowlistFieldProps = {
  disabled?: boolean;
};

export function MimeAllowlistField({ disabled }: MimeAllowlistFieldProps) {
  const { control } = useFormContext<EmbeddingSourceFormValues>();

  return (
    <FormField
      control={control}
      name="mimeTypes"
      render={({ field }) => {
        const selected = Array.isArray(field.value) ? field.value : [];
        return (
          <FormItem className="space-y-1.5">
            <FormLabel>Supported types</FormLabel>
            <FormDescription>
              Automatic extraction covers these types only. Leave all selected
              to index every supported file.
            </FormDescription>
            <div className="rounded-md border border-border/60 divide-y divide-border/60">
              {AUTOMATIC_STORAGE_MIME_TYPES.map(mime => {
                const checked = selected.includes(mime);
                return (
                  <label
                    key={mime}
                    className="flex min-h-8 cursor-pointer items-center gap-3 px-3 py-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={value => {
                          if (value === true) {
                            field.onChange([...selected, mime]);
                            return;
                          }
                          field.onChange(
                            selected.filter(item => item !== mime)
                          );
                        }}
                      />
                    </FormControl>
                    <span className="text-sm">
                      {MIME_LABELS[mime]}
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {mime}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
