'use client';

import Link from 'next/link';
import { useFormContext, useWatch } from 'react-hook-form';
import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import SelectField from '@/components/ui/form-inputs/SelectField';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { VECTOR_SIMILARITIES } from '@/lib/models/embeddings/config';
import {
  type ConfigProviderChoice,
  DIMENSIONS_HELP,
  findCatalogueModel,
  MODEL_ABSENT_EDIT_DETAIL,
  SETTINGS_CTA_LABEL,
  SETTINGS_HREF,
  similarityHelp,
} from '@/lib/models/embeddings/config-catalogue';
import { similarityLabel } from '@/lib/models/embeddings/index-state';
import type { EmbeddingSourceFormValues } from './schema';

type SourceProfileFieldsProps = {
  providers: ConfigProviderChoice[];
  locked?: boolean;
  modelBlocked?: boolean;
};

export function SourceProfileFields({
  providers,
  locked = false,
  modelBlocked = false,
}: SourceProfileFieldsProps) {
  const { control, setValue } = useFormContext<EmbeddingSourceFormValues>();
  const provider = useWatch({ control, name: 'provider' }) ?? '';
  const model = useWatch({ control, name: 'model' }) ?? '';
  const similarity = useWatch({ control, name: 'similarity' }) ?? 'cosine';
  const selectedProvider = providers.find(item => item.key === provider);
  const modelOptions = selectedProvider?.models ?? [];
  const providerKeys = providers.map(item => item.key);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modelBlocked ? (
        <div className="rounded-md border border-border/60 bg-surface-1 p-3 sm:col-span-2">
          <p className="text-sm text-pretty">{MODEL_ABSENT_EDIT_DETAIL}</p>
          <Link
            href={SETTINGS_HREF}
            className="mt-2 inline-flex min-h-8 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {SETTINGS_CTA_LABEL}
          </Link>
        </div>
      ) : null}
      {providerKeys.length > 0 ? (
        <SelectField
          fieldName="provider"
          label="Provider"
          placeholder="Select a provider"
          disabled={locked || providers.length <= 1}
          options={providerKeys}
          classNames={{ selectTrigger: 'h-8 min-h-8' }}
          onValueChange={value => {
            setValue('provider', value, {
              shouldDirty: true,
              shouldValidate: true,
            });
            const nextModels =
              providers.find(item => item.key === value)?.models ?? [];
            if (nextModels.some(item => item.name === model)) return;
            setValue('model', '', { shouldDirty: true, shouldValidate: true });
            setValue('dimensions', 0, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      ) : (
        <FormItem className="space-y-1.5">
          <FormLabel>Provider</FormLabel>
          <FormControl>
            <Input value="" readOnly disabled placeholder="Select a provider" />
          </FormControl>
          <FormDescription>
            Configure a provider before creating a source.{' '}
            <Link
              href={SETTINGS_HREF}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {SETTINGS_CTA_LABEL}
            </Link>
          </FormDescription>
        </FormItem>
      )}
      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Model</FormLabel>
            <FormControl>
              <SearchableCombobox
                value={field.value}
                disabled={locked || !provider || modelOptions.length === 0}
                placeholder={locked && model ? model : 'Select a model'}
                searchPlaceholder="Search models"
                emptyLabel="No matching models"
                ariaLabel="Model"
                options={
                  locked && model
                    ? [{ value: model, label: model }]
                    : modelOptions.map(item => ({
                        value: item.name,
                        label: item.name,
                      }))
                }
                onValueChange={next => {
                  const catalogue = findCatalogueModel(
                    providers,
                    provider,
                    next
                  );
                  setValue('model', next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue('dimensions', catalogue?.dimensions ?? 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </FormControl>
            <FormDescription className="text-xs">
              {locked
                ? 'Model is fixed after create.'
                : 'From the selected provider catalogue.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="dimensions"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Dimensions</FormLabel>
            <FormDescription>{DIMENSIONS_HELP}</FormDescription>
            <FormControl>
              <Input
                value={field.value || ''}
                disabled
                className="font-mono disabled:bg-muted disabled:text-foreground disabled:opacity-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <SelectField
        fieldName="similarity"
        label="Similarity"
        disabled={locked}
        options={VECTOR_SIMILARITIES.map(value => ({
          value,
          label: similarityLabel(value),
        }))}
        description={
          locked
            ? 'Similarity is fixed after create.'
            : similarityHelp(similarity)
        }
        classNames={{ selectTrigger: 'h-8 min-h-8' }}
      />
    </div>
  );
}
