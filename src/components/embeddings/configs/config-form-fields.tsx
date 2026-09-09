'use client';

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Link from 'next/link';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { SourceFieldsPicker } from '@/components/embeddings/configs/source-fields-picker';
import { EmbeddingConfigFormValues } from '@/components/embeddings/configs/schema';
import { VECTOR_SIMILARITIES } from '@/lib/models/embeddings/config';
import { similarityLabel } from '@/lib/models/embeddings/index-state';
import {
  EmbeddingSchemaChoice,
  listSourceFieldChoices,
} from '@/lib/models/embeddings/source-fields';

type ConfigFormFieldsProps = {
  schemas: EmbeddingSchemaChoice[];
  schemaLocked?: boolean;
  enableAllowed: boolean;
  enableBlockedReason?: string;
  enableBlockedHref?: string;
  enableBlockedAction?: string;
};

export function ConfigFormFields({
  schemas,
  schemaLocked = false,
  enableAllowed,
  enableBlockedReason,
  enableBlockedHref,
  enableBlockedAction,
}: ConfigFormFieldsProps) {
  const { control, setValue } = useFormContext<EmbeddingConfigFormValues>();
  const schemaName = useWatch({ control, name: 'schemaName' }) ?? '';
  const sourceFields = useWatch({ control, name: 'sourceFields' }) ?? [];
  const enabled = useWatch({ control, name: 'enabled' }) === true;

  const selectedSchema = schemas.find(schema => schema.name === schemaName);
  const choices = useMemo(
    () => listSourceFieldChoices(selectedSchema?.fields ?? {}, sourceFields),
    [selectedSchema, sourceFields]
  );

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <SelectField
        fieldName="schemaName"
        label="Schema"
        placeholder="Select a schema"
        disabled={schemaLocked || schemas.length === 0}
        options={schemas.map(schema => schema.name)}
        onValueChange={
          schemaLocked
            ? undefined
            : value => {
                setValue('schemaName', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue('sourceFields', [], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
        }
        description={
          schemaLocked
            ? 'Schema cannot change after create.'
            : schemas.length === 0
              ? 'No eligible Database schemas are available.'
              : 'Hidden, system, and embeddings-owned schemas are omitted.'
        }
      />
      <InputField
        fieldName="targetField"
        label="Target field"
        placeholder="embedding"
        description="Vector field written on each document."
      />
      <div className="md:col-span-2">
        <SourceFieldsPicker
          choices={schemaName ? choices : []}
          hasSchema={Boolean(schemaName)}
        />
      </div>
      <InputField
        fieldName="provider"
        label="Provider"
        placeholder="openai-compatible"
      />
      <InputField
        fieldName="model"
        label="Model"
        placeholder="text-embedding-3-small"
      />
      <InputField
        fieldName="dimensions"
        label="Dimensions"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        description="Cannot change dimensions on the same target field."
      />
      <SelectField
        fieldName="similarity"
        label="Similarity"
        options={VECTOR_SIMILARITIES.map(value => ({
          value,
          label: similarityLabel(value),
        }))}
      />
      <div className="md:col-span-2 min-h-8">
        <SwitchField
          fieldName="enabled"
          label="Enabled"
          disabled={!enableAllowed && !enabled}
        />
        <p className="pl-1 text-xs text-muted-foreground">
          {enableAllowed
            ? 'Documents will embed after the matching index is queryable.'
            : (enableBlockedReason ??
              'Enablement stays off until workers, capabilities, and a matching index are ready.')}
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
