'use client';

import { useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';
import {
  Comparison,
  ComparisonOperationEnum,
  OperationsEnum,
  ValueSourceTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import { cn } from '@/lib/utils';
import { QueryAssignmentRow } from './query-assignment-row';
import { QueryModelField, QueryRowRemoveButton } from './query-compact-fields';
import { QueryConditionRow } from './query-condition-row';

type LogicType = 'AND' | 'OR';

export function countConditions(group: unknown): number {
  if (!group || typeof group !== 'object') return 0;
  const nested = group as { AND?: unknown[]; OR?: unknown[] };
  const items = nested.AND ?? nested.OR;
  if (!Array.isArray(items)) return 0;
  return items.reduce((count: number, condition: unknown) => {
    if (
      condition &&
      typeof condition === 'object' &&
      ('AND' in condition || 'OR' in condition)
    ) {
      return count + countConditions(condition);
    }
    return count + 1;
  }, 0);
}

function isConditionGroup(
  value: unknown
): value is { AND?: unknown[]; OR?: unknown[] } {
  return (
    !!value && typeof value === 'object' && ('AND' in value || 'OR' in value)
  );
}

function emptyFindCopy(operation: OperationsEnum): {
  title: string;
  detail: string;
} {
  switch (operation) {
    case OperationsEnum.DELETE:
      return {
        title: 'No filters — this deletes every document',
        detail: 'Add a condition unless you intend to match the entire model.',
      };
    case OperationsEnum.PUT:
    case OperationsEnum.PATCH:
      return {
        title: 'No filters — this updates every document',
        detail: 'Add a condition unless you intend to match the entire model.',
      };
    case OperationsEnum.POST:
      return {
        title: 'No find conditions',
        detail: 'Create endpoints usually skip find filters.',
      };
    case OperationsEnum.GET:
      return {
        title: 'No filters — this returns every document',
        detail: 'Add a condition to narrow the result set.',
      };
    default: {
      const _exhaustive: never = operation;
      return _exhaustive;
    }
  }
}

function QueryLogicToggle({
  value,
  onChange,
}: {
  value: LogicType;
  onChange: (next: LogicType) => void;
}) {
  const options: { value: LogicType; hint: string }[] = [
    { value: 'AND', hint: 'Every condition must match' },
    { value: 'OR', hint: 'Any condition may match' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Group logic"
      className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1"
      onKeyDown={event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        onChange(value === 'AND' ? 'OR' : 'AND');
      }}
    >
      {options.map(option => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={option.hint}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-3 text-xs font-medium motion-reduce:transition-none transition-colors',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.value}
          </button>
        );
      })}
    </div>
  );
}

interface QueryConditionGroupProps {
  path?: string;
  isNested?: boolean;
  modelFields: QueryModelField[];
  operation: OperationsEnum;
}

export function QueryConditionGroup({
  path = 'query',
  isNested = false,
  modelFields,
  operation,
}: QueryConditionGroupProps) {
  const form = useFormContext();
  const groupRoot = form.watch(path) as { AND?: unknown; OR?: unknown };
  const groupType: LogicType = groupRoot?.AND ? 'AND' : 'OR';
  const conditions =
    (form.watch(`${path}.${groupType}`) as unknown[] | undefined) ?? [];
  const hasConditions = conditions.length > 0;
  const nestedCount = countConditions(groupRoot);
  const emptyCopy = isNested
    ? {
        title: `No conditions in this ${groupType} group`,
        detail: 'Add a condition or another nested group.',
      }
    : emptyFindCopy(operation);

  const setDirtyValue = (
    target: string,
    value: unknown,
    shouldValidate = true
  ) => {
    form.setValue(target, value as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate,
    });
  };

  const addCondition = () => {
    const current = (form.getValues(`${path}.${groupType}`) as unknown[]) ?? [];
    const hasInputs =
      ((form.getValues('inputs') as unknown[]) ?? []).length > 0;
    const condition: Comparison = {
      schemaField: '',
      operation: ComparisonOperationEnum.EQUAL,
      comparisonField: {
        type: hasInputs
          ? ValueSourceTypeEnum.INPUT
          : ValueSourceTypeEnum.CUSTOM,
        value: '',
      },
    };
    setDirtyValue(`${path}.${groupType}`, [...current, condition], false);
  };

  const addNestedGroup = () => {
    const current = (form.getValues(`${path}.${groupType}`) as unknown[]) ?? [];
    const nestedType: LogicType = groupType === 'AND' ? 'OR' : 'AND';
    setDirtyValue(
      `${path}.${groupType}`,
      [...current, { [nestedType]: [] }],
      false
    );
  };

  const removeFromGroup = (parentPath: string, index: number) => {
    const current = (form.getValues(parentPath) as unknown[]) ?? [];
    const next = [...current];
    next.splice(index, 1);
    setDirtyValue(parentPath, next);
  };

  const switchLogic = (next: LogicType) => {
    if (next === groupType) return;
    const items = groupRoot?.AND ?? groupRoot?.OR ?? [];
    setDirtyValue(path, { [next]: items });
  };

  return (
    <div
      className={cn(
        isNested && 'rounded-lg border border-border/60 bg-muted/20'
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-2',
          isNested ? 'px-3 py-2' : 'pb-3'
        )}
      >
        {!isNested && (
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="text-sm font-medium">Find Conditions</h3>
            <QueryFieldHint content="Documents must match this group. AND requires every condition; OR requires any condition." />
            {hasConditions && (
              <Badge variant="secondary" className="font-normal tabular-nums">
                {nestedCount}
              </Badge>
            )}
          </div>
        )}

        <QueryLogicToggle value={groupType} onChange={switchLogic} />
        <p className="hidden text-xs text-muted-foreground sm:block">
          {groupType === 'AND'
            ? 'Every condition must match'
            : 'Any condition may match'}
        </p>

        {isNested && (
          <Badge variant={groupType === 'AND' ? 'secondary' : 'outline'}>
            {nestedCount} condition{nestedCount !== 1 ? 's' : ''}
          </Badge>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
          >
            <Plus className="mr-1.5 size-3.5" />
            Condition
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNestedGroup}
          >
            <Plus className="mr-1.5 size-3.5" />
            {groupType === 'AND' ? 'OR' : 'AND'} group
          </Button>
          {isNested && (
            <QueryRowRemoveButton
              label="Remove group"
              tooltip="Remove this group from the draft. Save to persist."
              onRemove={() => {
                const pathParts = path.split('.');
                const index = Number.parseInt(pathParts.pop() ?? '0', 10);
                const parentPath = pathParts.join('.');
                removeFromGroup(parentPath, index);
              }}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          'space-y-2 border-l-2 pl-3',
          isNested && 'px-3 pb-3',
          groupType === 'AND'
            ? 'border-primary/40'
            : 'border-muted-foreground/30'
        )}
      >
        {!hasConditions ? (
          <div className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center">
            <p className="text-sm text-foreground">{emptyCopy.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {emptyCopy.detail}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conditions.map((condition, index) => {
              const childPath = `${path}.${groupType}.${index}`;
              if (isConditionGroup(condition)) {
                return (
                  <QueryConditionGroup
                    key={childPath}
                    path={childPath}
                    isNested
                    modelFields={modelFields}
                    operation={operation}
                  />
                );
              }
              return (
                <QueryConditionRow
                  key={childPath}
                  path={childPath}
                  parentPath={`${path}.${groupType}`}
                  index={index}
                  modelFields={modelFields}
                  onRemove={removeFromGroup}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface QueryAssignmentsProps {
  fields: { id: string }[];
  modifiableFields: QueryModelField[];
  operationLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function QueryAssignments({
  fields,
  modifiableFields,
  operationLabel,
  onAdd,
  onRemove,
}: QueryAssignmentsProps) {
  const hasAssignments = fields.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="text-sm font-medium">Set Values</h3>
          <QueryFieldHint content="Fields written when this Create, Update, or Patch endpoint runs." />
          {hasAssignments && (
            <Badge variant="secondary" className="font-normal tabular-nums">
              {fields.length}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={onAdd}
        >
          <Plus className="mr-1.5 size-3.5" />
          Set value
        </Button>
      </div>

      {!hasAssignments ? (
        <div className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center">
          <p className="text-sm text-foreground">No values to write</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add the fields this {operationLabel} operation should set.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <QueryAssignmentRow
              key={field.id}
              index={index}
              modifiableFields={modifiableFields}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
