'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Plus, X, Boxes, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypePicker, FieldType } from './type-picker';
import { ExtraOptionsPopover } from './extra-options-popover';
import { RelationPicker } from './relation-picker';
import { NestedFieldsEditor } from './nested-fields-editor';

export type FormField = {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  isArray?: boolean;
  select?: boolean;
  default?: string;
  description?: string;
  relatedModel?: string;
  fields?: FormField[];
};

type FieldsTableProps = {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  availableModels: string[];
  disabled?: boolean;
  depth?: number;
  maxDepth?: number;
  className?: string;
  committedFieldNames?: string[];
  fillHeight?: boolean;
};

type PendingTypeChange = {
  field: FormField;
  nextType: FieldType;
};

const FIELD_GRID =
  'grid grid-cols-[32px_minmax(10rem,14rem)_10rem_minmax(11rem,1fr)_3.25rem_3.25rem_3.25rem_3.25rem_2rem_2rem] gap-2';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function transformFieldsForApi(
  fields: FormField[]
): Record<string, any> {
  const result: Record<string, any> = {};

  fields.forEach(field => {
    let fieldDef: any = {};

    if (field.type === 'Group' && field.fields?.length) {
      fieldDef = transformFieldsForApi(field.fields);
    } else {
      fieldDef = { type: field.type };

      if (field.required) fieldDef.required = true;
      if (field.unique) fieldDef.unique = true;
      if (field.select !== undefined) fieldDef.select = field.select;
      if (field.default) {
        if (field.type === 'JSON') {
          try {
            fieldDef.default = JSON.parse(field.default);
          } catch {
            fieldDef.default = field.default;
          }
        } else if (field.type === 'Number') {
          const asNumber = Number(field.default);
          fieldDef.default = Number.isNaN(asNumber) ? field.default : asNumber;
        } else if (field.type === 'Boolean') {
          fieldDef.default = field.default === 'true';
        } else {
          fieldDef.default = field.default;
        }
      }
      if (field.description) fieldDef.description = field.description;

      if (field.type === 'Relation' && field.relatedModel) {
        fieldDef.model = field.relatedModel;
      }
    }

    result[field.name] = field.isArray ? [fieldDef] : fieldDef;
  });

  return result;
}

function typeChangeDiscardsConfig(field: FormField, nextType: FieldType) {
  if (field.type === nextType) return false;
  if (
    field.type === 'Relation' &&
    Boolean(field.relatedModel) &&
    nextType !== 'Relation'
  ) {
    return true;
  }
  if (
    field.type === 'Group' &&
    (field.fields?.length ?? 0) > 0 &&
    nextType !== 'Group'
  ) {
    return true;
  }
  return false;
}

function getTypeChangeUpdates(type: FieldType): Partial<FormField> {
  return {
    type,
    ...(type !== 'Relation' ? { relatedModel: undefined } : {}),
    ...(type !== 'Group' ? { fields: undefined } : { isArray: false }),
  };
}

function ColumnHint({
  label,
  hint,
  className,
}: {
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'cursor-help text-xs font-medium tracking-wide text-muted-foreground underline decoration-dotted decoration-muted-foreground/70 underline-offset-4 hover:text-foreground',
            className
          )}
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-pretty">
        <p>{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ControlHint({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-pretty">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function FieldsTable({
  fields,
  onFieldsChange,
  availableModels,
  disabled = false,
  depth,
  maxDepth,
  className,
  committedFieldNames,
  fillHeight = false,
}: FieldsTableProps) {
  const [openRelationFieldId, setOpenRelationFieldId] = React.useState<
    string | null
  >(null);
  const [autoOpenGroup, setAutoOpenGroup] = React.useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(
    null
  );
  const [fieldToRemove, setFieldToRemove] = React.useState<FormField | null>(
    null
  );
  const [pendingTypeChange, setPendingTypeChange] =
    React.useState<PendingTypeChange | null>(null);

  const committedNames = React.useMemo(
    () => new Set(committedFieldNames ?? []),
    [committedFieldNames]
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newFields = Array.from(fields);
    const [removed] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, removed);

    onFieldsChange(newFields);
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: generateId(),
      name: `field${fields.length + 1}`,
      type: 'String',
    };
    onFieldsChange([...fields, newField]);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    onFieldsChange(
      fields.map(f => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const applyTypeChange = (field: FormField, type: FieldType) => {
    if (type === 'Group' && field.type !== 'Group') {
      setAutoOpenGroup(field.id);
    }
    if (type === 'Relation' && field.type !== 'Relation') {
      setOpenRelationFieldId(field.id);
    }
    handleUpdateField(field.id, getTypeChangeUpdates(type));
  };

  const handleTypeChange = (field: FormField, type: FieldType) => {
    if (typeChangeDiscardsConfig(field, type)) {
      setPendingTypeChange({ field, nextType: type });
      return;
    }
    applyTypeChange(field, type);
  };

  const handleDeleteField = (fieldId: string) => {
    onFieldsChange(fields.filter(f => f.id !== fieldId));
  };

  const fieldLabel = fieldToRemove?.name.trim() || 'this field';
  const removingCommittedField = Boolean(
    fieldToRemove &&
    committedFieldNames &&
    committedNames.has(fieldToRemove.name)
  );

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-lg border',
          fillHeight && 'h-full min-h-0',
          className
        )}
      >
        <div
          className={cn('overflow-auto', fillHeight && 'h-0 min-h-0 flex-1')}
        >
          <div className="min-w-[56rem]">
            <div
              className={cn(
                FIELD_GRID,
                'sticky top-0 z-10 border-b bg-muted px-3 py-2 text-xs font-medium text-muted-foreground'
              )}
            >
              <div />
              <div>Name</div>
              <div>Type</div>
              <div>Default</div>
              <div className="border-l border-border/70 text-center">
                <ColumnHint
                  label="Req"
                  hint="Documents must include a value for this field."
                />
              </div>
              <div className="text-center">
                <ColumnHint
                  label="Uniq"
                  hint="Values must be unique. Unique fields are also marked required."
                />
              </div>
              <div className="text-center">
                <ColumnHint
                  label="Arr"
                  hint="Store multiple values of this type."
                />
              </div>
              <div className="text-center">
                <ColumnHint
                  label="PK"
                  hint="Sets the field to ObjectId, required, and unique. Unchecking clears required and unique, but leaves the type unchanged."
                />
              </div>
              <div />
              <div />
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`fields-table-${depth ?? 0}`}>
                {provided => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y"
                  >
                    {fields.map((field, index) => {
                      const isGroup = field.type === 'Group';
                      const displayName = field.name.trim() || 'field';

                      return (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                          isDragDisabled={disabled}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                FIELD_GRID,
                                'items-center bg-background px-3 py-2 transition-colors hover:bg-muted/30',
                                snapshot.isDragging && 'bg-muted shadow-2',
                                disabled && 'opacity-75'
                              )}
                            >
                              <ControlHint content="Drag to reorder">
                                <div
                                  {...provided.dragHandleProps}
                                  aria-label={`Reorder ${displayName}`}
                                  className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground',
                                    disabled
                                      ? 'cursor-not-allowed opacity-50'
                                      : 'cursor-grab'
                                  )}
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                              </ControlHint>

                              <div className="flex min-w-0 items-center gap-2">
                                <Input
                                  value={field.name}
                                  onChange={e =>
                                    handleUpdateField(field.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="field_name"
                                  aria-label={`Field name for ${displayName}`}
                                  className="h-8 font-mono text-sm slashed-zero"
                                  disabled={disabled}
                                />
                                {field.type === 'Relation' &&
                                  field.relatedModel && (
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 font-mono text-xs font-normal"
                                    >
                                      → {field.relatedModel}
                                    </Badge>
                                  )}
                              </div>

                              <div className="min-w-0">
                                <TypePicker
                                  value={field.type}
                                  onChange={type =>
                                    handleTypeChange(field, type)
                                  }
                                  disabled={disabled}
                                  disableGroup={
                                    depth !== undefined &&
                                    maxDepth !== undefined &&
                                    depth >= maxDepth
                                  }
                                />
                              </div>

                              <div className="min-w-0">
                                {field.type === 'Relation' ? (
                                  <RelationPicker
                                    value={field.relatedModel}
                                    onChange={model =>
                                      handleUpdateField(field.id, {
                                        relatedModel: model,
                                      })
                                    }
                                    availableModels={availableModels}
                                    disabled={disabled}
                                    open={openRelationFieldId === field.id}
                                    onOpenChange={open => {
                                      if (open) {
                                        setOpenRelationFieldId(field.id);
                                        return;
                                      }
                                      if (openRelationFieldId === field.id) {
                                        setOpenRelationFieldId(null);
                                      }
                                    }}
                                  />
                                ) : field.type === 'Group' ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-full justify-between px-2 text-xs font-normal"
                                      onClick={() =>
                                        setEditingGroupId(field.id)
                                      }
                                      disabled={disabled}
                                    >
                                      <div className="flex min-w-0 items-center gap-1.5 truncate">
                                        <Boxes className="h-3.5 w-3.5 shrink-0 text-primary-muted-foreground" />
                                        <span className="truncate">
                                          Edit fields
                                        </span>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="h-5 px-1.5 font-medium tabular-nums text-[10px]"
                                      >
                                        {field.fields?.length || 0}
                                      </Badge>
                                    </Button>
                                    <NestedFieldsEditor
                                      open={
                                        autoOpenGroup === field.id ||
                                        editingGroupId === field.id
                                      }
                                      onOpenChange={open => {
                                        if (!open) {
                                          if (autoOpenGroup === field.id) {
                                            setAutoOpenGroup(null);
                                          }
                                          if (editingGroupId === field.id) {
                                            setEditingGroupId(null);
                                          }
                                        }
                                      }}
                                      fieldName={field.name}
                                      fields={field.fields || []}
                                      onSave={nestedFields =>
                                        handleUpdateField(field.id, {
                                          fields: nestedFields,
                                        })
                                      }
                                      availableModels={availableModels}
                                      depth={(depth || 0) + 1}
                                      maxDepth={maxDepth}
                                    />
                                  </>
                                ) : (
                                  <Input
                                    value={field.default ?? ''}
                                    onChange={e =>
                                      handleUpdateField(field.id, {
                                        default: e.target.value,
                                      })
                                    }
                                    placeholder={
                                      field.type === 'Date' ? 'now()' : '—'
                                    }
                                    aria-label={`Default value for ${displayName}`}
                                    className="h-8 font-mono text-sm slashed-zero"
                                    disabled={disabled}
                                  />
                                )}
                              </div>

                              <div className="flex justify-center border-l border-border/70">
                                <ControlHint
                                  content={
                                    isGroup
                                      ? 'Group fields use nested field rules, so Required is disabled.'
                                      : 'Documents must include a value for this field.'
                                  }
                                >
                                  <Checkbox
                                    aria-label={
                                      isGroup
                                        ? `Required is disabled for ${displayName} because group fields use nested field rules`
                                        : `Mark ${displayName} as required`
                                    }
                                    checked={field.required ?? false}
                                    onCheckedChange={checked =>
                                      handleUpdateField(field.id, {
                                        required: Boolean(checked),
                                        ...(checked ? {} : { unique: false }),
                                      })
                                    }
                                    disabled={disabled || isGroup}
                                  />
                                </ControlHint>
                              </div>

                              <div className="flex justify-center">
                                <ControlHint
                                  content={
                                    isGroup
                                      ? 'Group fields cannot be unique. Add unique constraints to nested fields instead.'
                                      : 'Values must be unique. Enabling Unique also marks the field required.'
                                  }
                                >
                                  <Checkbox
                                    aria-label={
                                      isGroup
                                        ? `Unique is disabled for ${displayName} because group fields cannot be unique`
                                        : `Mark ${displayName} as unique`
                                    }
                                    checked={field.unique ?? false}
                                    onCheckedChange={checked =>
                                      handleUpdateField(field.id, {
                                        unique: Boolean(checked),
                                        ...(checked ? { required: true } : {}),
                                      })
                                    }
                                    disabled={disabled || isGroup}
                                  />
                                </ControlHint>
                              </div>

                              <div className="flex justify-center">
                                <ControlHint
                                  content={
                                    isGroup
                                      ? 'Nested groups cannot be arrays in this editor.'
                                      : 'Store multiple values of this type.'
                                  }
                                >
                                  <Checkbox
                                    aria-label={
                                      isGroup
                                        ? `Array is disabled for ${displayName} because nested groups cannot be arrays`
                                        : `Make ${displayName} an array`
                                    }
                                    checked={field.isArray ?? false}
                                    onCheckedChange={checked =>
                                      handleUpdateField(field.id, {
                                        isArray: Boolean(checked),
                                      })
                                    }
                                    disabled={disabled || isGroup}
                                  />
                                </ControlHint>
                              </div>

                              <div className="flex justify-center">
                                <ControlHint content="Sets type to ObjectId, required, and unique. Unchecking clears required and unique, but leaves the type unchanged.">
                                  <Checkbox
                                    aria-label={`Use ${displayName} as primary identifier`}
                                    checked={
                                      field.type === 'ObjectId' &&
                                      Boolean(field.unique) &&
                                      Boolean(field.required)
                                    }
                                    onCheckedChange={checked => {
                                      if (checked) {
                                        handleUpdateField(field.id, {
                                          type: 'ObjectId',
                                          unique: true,
                                          required: true,
                                        });
                                      } else {
                                        handleUpdateField(field.id, {
                                          unique: false,
                                          required: false,
                                        });
                                      }
                                    }}
                                    disabled={disabled}
                                  />
                                </ControlHint>
                              </div>

                              <div className="flex justify-center">
                                <ExtraOptionsPopover
                                  field={field}
                                  onUpdate={updates =>
                                    handleUpdateField(field.id, updates)
                                  }
                                  disabled={disabled || isGroup}
                                />
                              </div>

                              <div className="flex justify-center">
                                <ControlHint content={`Remove ${displayName}`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => setFieldToRemove(field)}
                                    disabled={disabled}
                                    aria-label={`Remove ${displayName}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </ControlHint>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {fields.length === 0 && (
                      <EmptyState
                        icon={Table2}
                        title="No fields yet"
                        description="Add a field to define this schema. Names must start with a letter or underscore."
                        className="py-12"
                      />
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {!disabled && (
              <div className="sticky bottom-0 z-20 border-t bg-muted px-3 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddField}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add field
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={fieldToRemove !== null}
        onOpenChange={open => {
          if (!open) setFieldToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {fieldLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              {removingCommittedField ? (
                <>
                  This stages{' '}
                  <strong className="font-mono">{fieldLabel}</strong> for
                  removal. Save the schema to persist the change. Existing
                  documents may still store this value until you save.
                </>
              ) : committedFieldNames ? (
                <>
                  <strong className="font-mono">{fieldLabel}</strong> has not
                  been saved yet and will be discarded from the editor.
                </>
              ) : (
                <>
                  This stages{' '}
                  <strong className="font-mono">{fieldLabel}</strong> for
                  removal. Save to persist the change.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (fieldToRemove) {
                  handleDeleteField(fieldToRemove.id);
                }
                setFieldToRemove(null);
              }}
            >
              Remove field
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingTypeChange !== null}
        onOpenChange={open => {
          if (!open) setPendingTypeChange(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change {pendingTypeChange?.field.name.trim() || 'this field'}{' '}
              type?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTypeChange?.field.type === 'Relation' ? (
                <>
                  Changing from Relation to {pendingTypeChange.nextType}{' '}
                  discards the related model
                  {pendingTypeChange.field.relatedModel ? (
                    <>
                      {' '}
                      (
                      <strong className="font-mono">
                        {pendingTypeChange.field.relatedModel}
                      </strong>
                      )
                    </>
                  ) : null}
                  .
                </>
              ) : (
                <>
                  Changing from Group to {pendingTypeChange?.nextType} discards{' '}
                  {pendingTypeChange?.field.fields?.length ?? 0} nested{' '}
                  {(pendingTypeChange?.field.fields?.length ?? 0) === 1
                    ? 'field'
                    : 'fields'}
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingTypeChange) {
                  applyTypeChange(
                    pendingTypeChange.field,
                    pendingTypeChange.nextType
                  );
                }
                setPendingTypeChange(null);
              }}
            >
              Change type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
