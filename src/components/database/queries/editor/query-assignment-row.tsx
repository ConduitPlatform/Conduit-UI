'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import {
  AssignmentActionEnum,
  ValueSourceTypeEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import { cn } from '@/lib/utils';
import { assignmentOperations, valueSourceTypes } from './constants';
import {
  COMPACT_SELECT_TRIGGER,
  compactFieldLabel,
  QueryCollapsibleRow,
  QueryEnumSelect,
  QueryModelField,
} from './query-compact-fields';
import { getAssignmentSummary, getTypeIcon } from './utils';

interface QueryAssignmentRowProps {
  index: number;
  modifiableFields: QueryModelField[];
  onRemove: (index: number) => void;
}

export function QueryAssignmentRow({
  index,
  modifiableFields,
  onRemove,
}: QueryAssignmentRowProps) {
  const form = useFormContext();
  const prefix = `assignments.${index}`;
  const schemaField = form.watch(`${prefix}.schemaField`) as string | undefined;
  const sourceType = form.watch(
    `${prefix}.assignmentField.type`
  ) as ValueSourceTypeEnum;
  const assignmentValue = form.watch(`${prefix}.assignmentField.value`) as
    | string
    | undefined;
  const action = Number(form.watch(`${prefix}.action`)) as AssignmentActionEnum;
  const inputs = (form.watch('inputs') as { name: string }[] | undefined) ?? [];
  const isIncomplete = !schemaField;
  const [open, setOpen] = React.useState(isIncomplete);
  const labelClass = compactFieldLabel();
  const actionLabel =
    assignmentOperations.find(option => option.value === action)?.label ??
    'Assign';

  return (
    <QueryCollapsibleRow
      open={open}
      onOpenChange={setOpen}
      summary={getAssignmentSummary({
        schemaField,
        action,
        sourceType,
        value: assignmentValue,
        index,
      })}
      isIncomplete={isIncomplete}
      collapsedBadges={
        !isIncomplete ? (
          <span className="ml-auto flex min-w-0 items-center gap-1.5">
            <Badge variant="outline" className="font-normal">
              {actionLabel}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {sourceType}
            </Badge>
          </span>
        ) : null
      }
      removeLabel={`Remove set value ${index + 1}`}
      removeTooltip="Remove this assignment from the draft. Save to persist."
      onRemove={() => onRemove(index)}
    >
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-4">
        <SelectField
          label="Field"
          placeholder="Select field"
          fieldName={`${prefix}.schemaField`}
          className="min-w-0"
          classNames={{
            label: labelClass,
            selectTrigger: COMPACT_SELECT_TRIGGER,
          }}
          options={modifiableFields.map(modelField => ({
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
          name={`${prefix}.action`}
          label="Action"
          options={assignmentOperations}
        />

        <SelectField
          label="Source"
          placeholder="Select source"
          fieldName={`${prefix}.assignmentField.type`}
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
                fieldName={`${prefix}.assignmentField.value`}
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
            fieldName={`${prefix}.assignmentField.value`}
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
            fieldName={`${prefix}.assignmentField.value`}
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
    </QueryCollapsibleRow>
  );
}
