'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';
import {
  ComparisonOperationEnum,
  ValueSourceTypeEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import { cn } from '@/lib/utils';
import { comparisonOperations, valueSourceTypes } from './constants';
import {
  COMPACT_SELECT_TRIGGER,
  compactFieldLabel,
  QueryCollapsibleRow,
  QueryEnumSelect,
  QueryModelField,
} from './query-compact-fields';
import { getConditionSummary, getTypeIcon } from './utils';

interface QueryConditionRowProps {
  path: string;
  parentPath: string;
  index: number;
  modelFields: QueryModelField[];
  onRemove: (parentPath: string, index: number) => void;
}

export function QueryConditionRow({
  path,
  parentPath,
  index,
  modelFields,
  onRemove,
}: QueryConditionRowProps) {
  const form = useFormContext();
  const fieldName = (suffix: string) => `${path}.${suffix}`;
  const schemaField = form.watch(fieldName('schemaField')) as
    | string
    | undefined;
  const sourceType = form.watch(
    fieldName('comparisonField.type')
  ) as ValueSourceTypeEnum;
  const comparisonValue = form.watch(fieldName('comparisonField.value')) as
    | string
    | undefined;
  const like = Boolean(form.watch(fieldName('comparisonField.like')));
  const caseSensitiveLike = Boolean(
    form.watch(fieldName('comparisonField.caseSensitiveLike'))
  );
  const operation = Number(
    form.watch(fieldName('operation'))
  ) as ComparisonOperationEnum;
  const inputs = (form.watch('inputs') as { name: string }[] | undefined) ?? [];
  const isEqual = operation === ComparisonOperationEnum.EQUAL;
  const isIncomplete = !schemaField;
  const [open, setOpen] = React.useState(isIncomplete);
  const labelClass = compactFieldLabel();
  const comparisonLabel =
    like && isEqual
      ? 'Like'
      : (comparisonOperations.find(option => option.value === operation)
          ?.label ?? 'Equal');

  return (
    <QueryCollapsibleRow
      open={open}
      onOpenChange={setOpen}
      summary={getConditionSummary({
        schemaField,
        operation,
        sourceType,
        value: comparisonValue,
        like,
        caseSensitiveLike,
        index,
      })}
      isIncomplete={isIncomplete}
      collapsedBadges={
        !isIncomplete ? (
          <span className="ml-auto flex min-w-0 items-center gap-1.5">
            <Badge variant="outline" className="font-normal">
              {comparisonLabel}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {sourceType}
            </Badge>
          </span>
        ) : null
      }
      removeLabel={`Remove condition ${index + 1}`}
      removeTooltip="Remove this condition from the draft. Save to persist."
      onRemove={() => onRemove(parentPath, index)}
    >
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-4">
        <SelectField
          label="Field"
          placeholder="Select field"
          fieldName={fieldName('schemaField')}
          className="min-w-0"
          classNames={{
            label: labelClass,
            selectTrigger: COMPACT_SELECT_TRIGGER,
          }}
          options={modelFields.map(modelField => ({
            value: modelField.name,
            label: (
              <div className="flex items-center gap-2">
                {getTypeIcon(modelField.type as ValueTypeEnum)}
                <span className="font-mono text-[13px] slashed-zero">
                  {modelField.name}
                </span>
                {modelField.isArray && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Array
                  </Badge>
                )}
              </div>
            ),
          }))}
        />

        <QueryEnumSelect
          name={fieldName('operation')}
          label="Comparison"
          options={comparisonOperations}
          onValueChange={next => {
            if (next !== ComparisonOperationEnum.EQUAL) {
              form.setValue(fieldName('comparisonField.like'), false, {
                shouldDirty: true,
              });
              form.setValue(
                fieldName('comparisonField.caseSensitiveLike'),
                false,
                { shouldDirty: true }
              );
            }
          }}
        />

        <SelectField
          label="Source"
          placeholder="Select source"
          fieldName={fieldName('comparisonField.type')}
          className="min-w-0"
          classNames={{
            label: labelClass,
            selectTrigger: COMPACT_SELECT_TRIGGER,
          }}
          options={valueSourceTypes.map(source => ({
            value: source.value,
            label: source.label,
          }))}
        />

        {sourceType === ValueSourceTypeEnum.INPUT && (
          <div className="min-w-0">
            {inputs.length === 0 ? (
              <div className="space-y-1.5">
                <p className={labelClass}>Value</p>
                <p className="flex h-8 items-center rounded-md bg-muted/50 px-3 text-[13px] text-muted-foreground">
                  Add an input first
                </p>
              </div>
            ) : (
              <SelectField
                label="Value"
                placeholder="Select input"
                fieldName={fieldName('comparisonField.value')}
                className="min-w-0"
                classNames={{
                  label: labelClass,
                  selectTrigger: cn(
                    COMPACT_SELECT_TRIGGER,
                    'font-mono slashed-zero'
                  ),
                }}
                options={inputs.map(input => ({
                  value: input.name,
                  label: input.name,
                }))}
              />
            )}
          </div>
        )}

        {sourceType === ValueSourceTypeEnum.CUSTOM && (
          <InputField
            label="Value"
            fieldName={fieldName('comparisonField.value')}
            placeholder="e.g. published"
            classNames={{
              label: labelClass,
              input: 'font-mono text-[13px] slashed-zero',
              formItem: 'min-w-0',
            }}
          />
        )}

        {sourceType === ValueSourceTypeEnum.CONTEXT && (
          <InputField
            label="Value"
            fieldName={fieldName('comparisonField.value')}
            placeholder="e.g. user._id"
            info="Request context path, such as user._id. Resolved when the endpoint runs."
            classNames={{
              label: labelClass,
              input: 'font-mono text-[13px] slashed-zero',
              formItem: 'min-w-0',
            }}
          />
        )}
      </div>

      {isEqual && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 px-3 py-2">
          <FormField
            control={form.control}
            name={fieldName('comparisonField.like')}
            render={({ field }) => (
              <FormItem className="flex min-h-8 flex-row items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={checked => {
                      const isChecked = Boolean(checked);
                      field.onChange(isChecked);
                      if (!isChecked) {
                        form.setValue(
                          fieldName('comparisonField.caseSensitiveLike'),
                          false,
                          { shouldDirty: true }
                        );
                      }
                    }}
                  />
                </FormControl>
                <div className="flex items-center gap-1">
                  <FormLabel className="font-normal">Like</FormLabel>
                  <QueryFieldHint content="Pattern match. Use % as a wildcard; the value is matched as %input%." />
                </div>
              </FormItem>
            )}
          />
          {like && (
            <FormField
              control={form.control}
              name={fieldName('comparisonField.caseSensitiveLike')}
              render={({ field }) => (
                <FormItem className="flex min-h-8 flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={Boolean(field.value)}
                      onCheckedChange={checked =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <div className="flex items-center gap-1">
                    <FormLabel className="font-normal">
                      Case sensitive
                    </FormLabel>
                    <QueryFieldHint content="When off, matching is case-insensitive (e.g. ILIKE on PostgreSQL)." />
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      )}
    </QueryCollapsibleRow>
  );
}
