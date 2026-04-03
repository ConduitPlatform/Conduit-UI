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
import {
  GripVertical,
  Plus,
  X,
  Settings2,
  Link2,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  FileJson,
  Boxes,
  List,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypePicker, FieldType } from './type-picker';
import { ExtraOptionsPopover } from './extra-options-popover';
import { RelationPicker } from './relation-picker';

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
  enumValues?: string | string[];
  relatedModel?: string;
  fields?: FormField[];
};

type FieldsTableProps = {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  availableModels: string[];
  disabled?: boolean;
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
      if (field.default) fieldDef.default = field.default;
      if (field.description) fieldDef.description = field.description;

      if (field.type === 'Relation' && field.relatedModel) {
        fieldDef.model = field.relatedModel;
      }

      if (field.type === 'Enum') {
        if (typeof field.enumValues === 'string') {
          fieldDef.enumValues = field.enumValues
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);
        } else if (Array.isArray(field.enumValues)) {
          fieldDef.enumValues = field.enumValues;
        }
      }
    }

    result[field.name] = field.isArray ? [fieldDef] : fieldDef;
  });

  return result;
}

const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  String: <Type className="w-3.5 h-3.5" />,
  Number: <Hash className="w-3.5 h-3.5" />,
  Boolean: <ToggleLeft className="w-3.5 h-3.5" />,
  Date: <Calendar className="w-3.5 h-3.5" />,
  Relation: <Link2 className="w-3.5 h-3.5" />,
  ObjectId: <Database className="w-3.5 h-3.5" />,
  JSON: <FileJson className="w-3.5 h-3.5" />,
  Group: <Boxes className="w-3.5 h-3.5" />,
  Enum: <List className="w-3.5 h-3.5" />,
};

export function FieldsTable({
  fields,
  onFieldsChange,
  availableModels,
  disabled = false,
}: FieldsTableProps) {
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
      <div className="grid grid-cols-[40px_1fr_150px_120px_80px_40px_40px] gap-2 px-3 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
        <div></div>
        <div>Name</div>
        <div>Type</div>
        <div>Default Value</div>
        <div className="text-center">Primary</div>
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
                        'grid grid-cols-[40px_1fr_150px_120px_80px_40px_40px] gap-2 px-3 py-2 items-center bg-background',
                        snapshot.isDragging && 'bg-muted shadow-lg'
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
                          onChange={type =>
                            handleUpdateField(field.id, { type })
                          }
                          disabled={disabled}
                        />
                      </div>

                      {/* Default Value */}
                      <div>
                        <Input
                          value={field.default || ''}
                          onChange={e =>
                            handleUpdateField(field.id, {
                              default: e.target.value,
                            })
                          }
                          placeholder={field.type === 'Date' ? 'now()' : ''}
                          className="h-8 text-sm"
                          disabled={disabled || field.type === 'Group'}
                        />
                      </div>

                      {/* Primary (for ObjectId) */}
                      <div className="flex justify-center">
                        <Checkbox
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
                          availableModels={availableModels}
                          onUpdate={updates =>
                            handleUpdateField(field.id, updates)
                          }
                          disabled={disabled}
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
