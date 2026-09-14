'use client';

import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SourceFieldChoice } from '@/lib/models/embeddings/source-fields';
import { cn } from '@/lib/utils';

type SourceFieldsPickerProps = {
  choices: SourceFieldChoice[];
  hasSchema?: boolean;
};

export function SourceFieldsPicker({
  choices,
  hasSchema = true,
}: SourceFieldsPickerProps) {
  const { control } = useFormContext();

  return (
    <FormField
      name="sourceFields"
      control={control}
      render={({ field }) => {
        const selected = Array.isArray(field.value)
          ? field.value.filter(
              (item): item is string => typeof item === 'string'
            )
          : [];
        return (
          <FormItem className="space-y-1.5">
            <FormLabel>Source fields</FormLabel>
            <FormDescription>
              String fields only. Hidden and sensitive fields are not offered.
            </FormDescription>
            {choices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {hasSchema
                  ? 'No eligible string fields on this schema.'
                  : 'Select a schema to see eligible fields.'}
              </p>
            ) : (
              <div className="rounded-md border border-border/60 divide-y divide-border/60">
                {choices.map(choice => {
                  const checked = selected.includes(choice.name);
                  return (
                    <label
                      key={choice.name}
                      className="flex min-h-8 cursor-pointer items-center gap-3 px-3 py-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={checked}
                          disabled={!choice.eligible && !checked}
                          onCheckedChange={value => {
                            if (value === true) {
                              field.onChange([...selected, choice.name]);
                              return;
                            }
                            field.onChange(
                              selected.filter(name => name !== choice.name)
                            );
                          }}
                        />
                      </FormControl>
                      <span
                        className={cn(
                          'text-sm',
                          !choice.eligible && 'text-muted-foreground'
                        )}
                      >
                        {choice.name}
                        {choice.eligible ? null : ' (not eligible)'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
