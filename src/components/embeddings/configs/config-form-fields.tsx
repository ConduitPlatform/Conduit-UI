'use client';

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { SourceFieldsPicker } from '@/components/embeddings/configs/source-fields-picker';
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
};

export function ConfigFormFields({
  schemas,
  schemaLocked = false,
  enableAllowed,
  enableBlockedReason,
}: ConfigFormFieldsProps) {
  const { control, setValue } = useFormContext();
  const schemaNameRaw = useWatch({ control, name: 'schemaName' });
  const sourceFieldsRaw = useWatch({ control, name: 'sourceFields' });
  const enabledRaw = useWatch({ control, name: 'enabled' });
  const schemaName = typeof schemaNameRaw === 'string' ? schemaNameRaw : '';
  const sourceFields = Array.isArray(sourceFieldsRaw)
    ? sourceFieldsRaw.filter((item): item is string => typeof item === 'string')
    : [];
  const enabled = enabledRaw === true;

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
        description="Positive integer. Changing this on the same target field is not allowed."
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
              'Enablement stays off until capabilities and a matching index are ready.')}
        </p>
      </div>
    </div>
  );
}
