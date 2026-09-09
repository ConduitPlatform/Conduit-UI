'use client';

import Link from 'next/link';
import { useFormContext, useWatch } from 'react-hook-form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { SearchableCombobox } from '@/components/embeddings/configs/searchable-combobox';
import { SourceFieldsPicker } from '@/components/embeddings/configs/source-fields-picker';
import { EmbeddingConfigFormValues } from '@/components/embeddings/configs/schema';
import { VECTOR_SIMILARITIES } from '@/lib/models/embeddings/config';
import {
  ConfigProviderChoice,
  DIMENSIONS_HELP,
  findCatalogueModel,
  SETTINGS_CTA_LABEL,
  SETTINGS_HREF,
  similarityHelp,
} from '@/lib/models/embeddings/config-catalogue';
import { similarityLabel } from '@/lib/models/embeddings/index-state';
import { EmbeddingSchemaFormChoice } from '@/lib/models/embeddings/source-fields';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type ConfigFormFieldsProps = {
  schemas: EmbeddingSchemaFormChoice[];
  providers: ConfigProviderChoice[];
  schemaLocked?: boolean;
  modelBlocked?: boolean;
  enableAllowed: boolean;
  enableBlockedReason?: string;
  enableBlockedHref?: string;
  enableBlockedAction?: string;
};

export function ConfigFormFields({
  schemas,
  providers,
  schemaLocked = false,
  modelBlocked = false,
  enableAllowed,
  enableBlockedReason,
  enableBlockedHref,
  enableBlockedAction,
}: ConfigFormFieldsProps) {
  const { control, setValue } = useFormContext<EmbeddingConfigFormValues>();
  const schemaName = useWatch({ control, name: 'schemaName' }) ?? '';
  const provider = useWatch({ control, name: 'provider' }) ?? '';
  const model = useWatch({ control, name: 'model' }) ?? '';
  const similarity = useWatch({ control, name: 'similarity' }) ?? 'cosine';
  const enabled = useWatch({ control, name: 'enabled' }) === true;

  const selectedSchema = schemas.find(schema => schema.name === schemaName);
  const choices = selectedSchema?.fields ?? [];
  const selectedProvider = providers.find(item => item.key === provider);
  const modelOptions = selectedProvider?.models ?? [];
  const providerKeys = providers.map(item => item.key);
  const providerOptions =
    provider && !providerKeys.includes(provider)
      ? [provider, ...providerKeys]
      : providerKeys;

  const selectModel = (nextModel: string) => {
    const catalogue = findCatalogueModel(providers, provider, nextModel);
    setValue('model', nextModel, { shouldDirty: true, shouldValidate: true });
    setValue('dimensions', catalogue?.dimensions ?? 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {modelBlocked ? (
        <div className="rounded-md border border-border/60 bg-surface-1 p-3 md:col-span-2">
          <p className="text-sm text-pretty">
            This model is not in the provider catalogue. Add it in Settings
            before changing this config.
          </p>
          <Link
            href={SETTINGS_HREF}
            className="mt-2 inline-flex min-h-8 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {SETTINGS_CTA_LABEL}
          </Link>
        </div>
      ) : null}
      <FormField
        control={control}
        name="schemaName"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Schema</FormLabel>
            <FormControl>
              <SearchableCombobox
                value={field.value}
                disabled={schemaLocked || schemas.length === 0 || modelBlocked}
                placeholder="Select a schema"
                searchPlaceholder="Search schemas"
                emptyLabel="No matching schemas"
                ariaLabel="Schema"
                options={schemas.map(schema => ({
                  value: schema.name,
                  label: schema.name,
                }))}
                onValueChange={value => {
                  field.onChange(value);
                  setValue('sourceFields', [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </FormControl>
            <FormDescription className="text-xs">
              {schemaLocked
                ? 'Schema cannot change after create.'
                : schemas.length === 0
                  ? 'No eligible Database schemas are available.'
                  : 'Disabled, system, and embeddings-owned schemas are omitted.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <InputField
        fieldName="targetField"
        label="Target field"
        placeholder="embedding"
        description="Vector field written on each document."
        disabled={modelBlocked}
      />
      <div className="md:col-span-2">
        <SourceFieldsPicker
          choices={schemaName ? choices : []}
          hasSchema={Boolean(schemaName)}
        />
      </div>
      <div className="space-y-1.5">
        {providerOptions.length > 0 ? (
          <SelectField
            fieldName="provider"
            label="Provider"
            placeholder="Select a provider"
            disabled={modelBlocked || providers.length <= 1}
            options={providerOptions}
            classNames={{ selectTrigger: 'h-8 min-h-8' }}
            onValueChange={value => {
              setValue('provider', value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              const nextModels =
                providers.find(item => item.key === value)?.models ?? [];
              if (!nextModels.some(item => item.name === model)) {
                setValue('model', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue('dimensions', 0, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
          />
        ) : (
          <div className="space-y-1.5">
            <p className="pl-1 text-base font-medium">Provider</p>
            <button
              type="button"
              disabled
              className="flex h-8 min-h-8 w-full items-center rounded-md border border-input px-3 text-left text-[13px] text-muted-foreground"
            >
              Select a provider
            </button>
          </div>
        )}
        <p className="pl-1 text-xs text-muted-foreground">
          {providers.length === 0
            ? 'Configure a provider before creating a config.'
            : providers.length === 1
              ? 'Only one provider is configured.'
              : 'Changing provider clears a model that is not in that catalogue.'}
          {providers.length === 0 ? (
            <>
              {' '}
              <Link
                href={SETTINGS_HREF}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {SETTINGS_CTA_LABEL}
              </Link>
            </>
          ) : null}
        </p>
      </div>
      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Model</FormLabel>
            <FormControl>
              <SearchableCombobox
                value={field.value}
                disabled={
                  modelBlocked || !provider || modelOptions.length === 0
                }
                placeholder={modelBlocked && model ? model : 'Select a model'}
                searchPlaceholder="Search models"
                emptyLabel="No matching models"
                ariaLabel="Model"
                options={
                  modelBlocked && model
                    ? [{ value: model, label: model }]
                    : modelOptions.map(item => ({
                        value: item.name,
                        label: item.name,
                      }))
                }
                onValueChange={selectModel}
              />
            </FormControl>
            <FormDescription className="text-xs">
              {modelBlocked
                ? 'The saved model is not in the current catalogue.'
                : 'Chosen from the selected provider catalogue.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <InputField
        fieldName="dimensions"
        label="Dimensions"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        readOnly
        disabled
        description={DIMENSIONS_HELP}
      />
      <SelectField
        fieldName="similarity"
        label="Similarity"
        disabled={modelBlocked}
        options={VECTOR_SIMILARITIES.map(value => ({
          value,
          label: similarityLabel(value),
        }))}
        description={similarityHelp(similarity)}
        classNames={{ selectTrigger: 'h-8 min-h-8' }}
      />
      <div className="min-h-8 md:col-span-2">
        <SwitchField
          fieldName="enabled"
          label="Enabled"
          disabled={modelBlocked || (!enableAllowed && !enabled)}
        />
        <p className="pl-1 text-xs text-muted-foreground">
          {enableAllowed
            ? 'Documents will embed after the matching index is queryable.'
            : (enableBlockedReason ??
              'Stays disabled until workers, capabilities, and a matching index are ready.')}
          {enableBlockedHref && enableBlockedAction ? (
            <>
              {' '}
              <Link
                href={enableBlockedHref}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {enableBlockedAction}
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
