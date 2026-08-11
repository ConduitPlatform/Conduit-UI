'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Plus, X, Boxes } from 'lucide-react';
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
};

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

export function FieldsTable({
  fields,
  onFieldsChange,
  availableModels,
  disabled = false,
  depth,
  maxDepth,
}: FieldsTableProps) {
  const [openRelationFieldId, setOpenRelationFieldId] = React.useState<
    string | null
  >(null);
  const [autoOpenGroup, setAutoOpenGroup] = React.useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(
    null
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

  const handleDeleteField = (fieldId: string) => {
    onFieldsChange(fields.filter(f => f.id !== fieldId));
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px_minmax(180px,1fr)_150px_120px_80px_80px_80px_80px_40px_40px] gap-2 px-3 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
        <div></div>
        <div>Name</div>
        <div>Type</div>
        <div>Default Value</div>
        <div className="text-center">Required</div>
        <div className="text-center">Unique</div>
        <div className="text-center">Array</div>
        <div
          className="text-center"
          title="Sets the field to ObjectId, required, and unique."
        >
          Primary
        </div>
        <div></div>
        <div></div>
      </div>

      {/* Fields */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields-table">
          {provided => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="divide-y"
            >
              {fields.map((field, index) => (
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
                        'grid grid-cols-[40px_minmax(180px,1fr)_150px_120px_80px_80px_80px_80px_40px_40px] gap-2 px-3 py-2 items-center bg-background transition-colors hover:bg-muted/30',
                        snapshot.isDragging && 'bg-muted shadow-lg',
                        disabled && 'opacity-75'
                      )}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className={cn(
                          'flex items-center justify-center cursor-grab text-muted-foreground hover:text-foreground',
                          disabled && 'cursor-not-allowed opacity-50'
                        )}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Name */}
                      <div className="flex items-center gap-2">
                        <Input
                          value={field.name}
                          onChange={e =>
                            handleUpdateField(field.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder="field_name"
                          className="h-8 font-mono text-sm"
                          disabled={disabled}
                        />
                        {field.type === 'Relation' && field.relatedModel && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs font-normal"
                          >
                            → {field.relatedModel}
                          </Badge>
                        )}
                      </div>

                      {/* Type */}
                      <div>
                        <TypePicker
                          value={field.type}
                          onChange={type => {
                            const isChangingToGroup =
                              type === 'Group' && field.type !== 'Group';
                            const isChangingToRelation =
                              type === 'Relation' && field.type !== 'Relation';

                            if (isChangingToGroup) setAutoOpenGroup(field.id);
                            if (isChangingToRelation) {
                              setOpenRelationFieldId(field.id);
                            }

                            handleUpdateField(field.id, {
                              type,
                              ...(type !== 'Relation'
                                ? { relatedModel: undefined }
                                : {}),
                              ...(type !== 'Group'
                                ? { fields: undefined }
                                : { isArray: false }),
                            });
                          }}
                          disabled={disabled}
                          disableGroup={
                            depth !== undefined &&
                            maxDepth !== undefined &&
                            depth >= maxDepth
                          }
                        />
                      </div>

                      {/* Default Value / Inline Configuration */}
                      <div>
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
                              className="w-full h-8 px-2 text-xs font-normal justify-between"
                              onClick={() => setEditingGroupId(field.id)}
                              disabled={disabled}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Boxes className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span className="truncate">Edit Fields</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-[10px] tabular-nums font-medium"
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
                            placeholder={field.type === 'Date' ? 'now()' : ''}
                            className="h-8 text-sm"
                            disabled={disabled}
                          />
                        )}
                      </div>

                      {/* Required */}
                      <div
                        className="flex justify-center"
                        title={
                          field.type === 'Group'
                            ? 'Group fields use their nested field rules, so Required is disabled.'
                            : undefined
                        }
                      >
                        <Checkbox
                          aria-label={
                            field.type === 'Group'
                              ? `Required is disabled for ${field.name || 'group'} because group fields use nested field rules`
                              : `Mark ${field.name || 'field'} as required`
                          }
                          checked={field.required ?? false}
                          onCheckedChange={checked =>
                            handleUpdateField(field.id, {
                              required: Boolean(checked),
                              ...(checked ? {} : { unique: false }),
                            })
                          }
                          disabled={disabled || field.type === 'Group'}
                        />
                      </div>

                      {/* Unique */}
                      <div
                        className="flex justify-center"
                        title={
                          field.type === 'Group'
                            ? 'Group fields cannot be marked unique. Add unique constraints to nested fields instead.'
                            : undefined
                        }
                      >
                        <Checkbox
                          aria-label={
                            field.type === 'Group'
                              ? `Unique is disabled for ${field.name || 'group'} because group fields cannot be unique`
                              : `Mark ${field.name || 'field'} as unique`
                          }
                          checked={field.unique ?? false}
                          onCheckedChange={checked =>
                            handleUpdateField(field.id, {
                              unique: Boolean(checked),
                              ...(checked ? { required: true } : {}),
                            })
                          }
                          disabled={disabled || field.type === 'Group'}
                        />
                      </div>

                      {/* Array */}
                      <div
                        className="flex justify-center"
                        title={
                          field.type === 'Group'
                            ? 'Nested groups cannot be arrays in this editor.'
                            : undefined
                        }
                      >
                        <Checkbox
                          aria-label={
                            field.type === 'Group'
                              ? `Array is disabled for ${field.name || 'group'} because nested groups cannot be arrays`
                              : `Make ${field.name || 'field'} an array`
                          }
                          checked={field.isArray ?? false}
                          onCheckedChange={checked =>
                            handleUpdateField(field.id, {
                              isArray: Boolean(checked),
                            })
                          }
                          disabled={disabled || field.type === 'Group'}
                        />
                      </div>

                      {/* Primary (for ObjectId) */}
                      <div className="flex justify-center">
                        <Checkbox
                          aria-label={`Use ${field.name || 'field'} as primary identifier`}
                          title="Sets type to ObjectId, required, and unique."
                          checked={
                            field.type === 'ObjectId' &&
                            field.unique &&
                            field.required
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
                      </div>

                      {/* Extra Options */}
                      <div className="flex justify-center">
                        <ExtraOptionsPopover
                          field={field}
                          onUpdate={updates =>
                            handleUpdateField(field.id, updates)
                          }
                          disabled={disabled || field.type === 'Group'}
                        />
                      </div>

                      {/* Delete */}
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteField(field.id)}
                          disabled={disabled}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {fields.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Add your first field to define this schema.
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Column Button */}
      {!disabled && (
        <div className="px-3 py-3 border-t bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddField}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add column
          </Button>
        </div>
      )}
    </div>
  );
}
