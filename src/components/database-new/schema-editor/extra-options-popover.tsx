'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings2, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField } from './fields-table';
import { FieldType } from './type-picker';
import { RelationPicker } from './relation-picker';
import { NestedFieldsEditor } from './nested-fields-editor';

type ExtraOptionsPopoverProps = {
  field: FormField;
  availableModels: string[];
  onUpdate: (updates: Partial<FormField>) => void;
  disabled?: boolean;
};

export function ExtraOptionsPopover({
  field,
  availableModels,
  onUpdate,
  disabled,
}: ExtraOptionsPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [nestedEditorOpen, setNestedEditorOpen] = React.useState(false);

  const hasOptions =
    field.required ||
    field.unique ||
    field.isArray ||
    field.description ||
    field.relatedModel ||
    field.enumValues ||
    (field.type === 'Group' && field.fields && field.fields.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8',
            hasOptions && 'text-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Extra options</h4>

          {/* Nullable / Required */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="nullable"
                className="text-sm font-normal cursor-pointer"
              >
                Is Nullable
              </Label>
              <p className="text-xs text-muted-foreground">Allow NULL values</p>
            </div>
            <Switch
              id="nullable"
              checked={!field.required}
              onCheckedChange={checked => onUpdate({ required: !checked })}
              disabled={disabled}
            />
          </div>

          {/* Unique */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="unique"
                className="text-sm font-normal cursor-pointer"
              >
                Is Unique
              </Label>
              <p className="text-xs text-muted-foreground">
                Values must be unique
              </p>
            </div>
            <Switch
              id="unique"
              checked={field.unique ?? false}
              onCheckedChange={checked => onUpdate({ unique: checked })}
              disabled={disabled}
            />
          </div>

          {/* Array */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="array"
                className="text-sm font-normal cursor-pointer"
              >
                Define as Array
              </Label>
              <p className="text-xs text-muted-foreground">
                Variable-length array
              </p>
            </div>
            <Switch
              id="array"
              checked={field.isArray ?? false}
              onCheckedChange={checked => onUpdate({ isArray: checked })}
              disabled={disabled}
            />
          </div>

          <Separator />

          {/* Type-specific options */}
          {field.type === 'Relation' && (
            <div className="space-y-2">
              <Label className="text-sm">Related Model</Label>
              <RelationPicker
                value={field.relatedModel}
                onChange={model => onUpdate({ relatedModel: model })}
                availableModels={availableModels}
                disabled={disabled}
              />
            </div>
          )}

          {field.type === 'Enum' && (
            <div className="space-y-2">
              <Label htmlFor="enum-values" className="text-sm">
                Enum Values
              </Label>
              <Input
                id="enum-values"
                placeholder="value1, value2, value3"
                value={
                  Array.isArray(field.enumValues)
                    ? field.enumValues.join(', ')
                    : field.enumValues || ''
                }
                onChange={e => onUpdate({ enumValues: e.target.value })}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of allowed values
              </p>
            </div>
          )}

          {field.type === 'Group' && (
            <div className="space-y-2">
              <Label className="text-sm">Nested Fields</Label>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setOpen(false);
                  setNestedEditorOpen(true);
                }}
                disabled={disabled}
              >
                <Boxes className="w-4 h-4" />
                Edit Nested Structure ({field.fields?.length || 0} fields)
              </Button>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe this field..."
              value={field.description || ''}
              onChange={e => onUpdate({ description: e.target.value })}
              rows={2}
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>

      {/* Nested Fields Editor Dialog */}
      <NestedFieldsEditor
        open={nestedEditorOpen}
        onOpenChange={setNestedEditorOpen}
        fieldName={field.name}
        fields={field.fields || []}
        onSave={nestedFields => onUpdate({ fields: nestedFields })}
        availableModels={availableModels}
      />
    </Popover>
  );
}
