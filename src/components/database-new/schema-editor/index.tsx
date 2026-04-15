'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { createSchema, patchSchema } from '@/lib/api/database';
import { FieldsTable, FormField, transformFieldsForApi } from './fields-table';
import { SchemaPreview } from './schema-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Code, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldType } from './type-picker';

type SchemaEditorProps = {
  schema: DeclaredSchema | null;
  availableModels: string[];
  onSave?: (schema?: DeclaredSchema) => void;
  onCancel?: () => void;
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function extractFieldsFromSchema(schemaFields: any): FormField[] {
  if (!schemaFields || typeof schemaFields !== 'object') return [];

  return Object.entries(schemaFields).map(
    ([name, definition]: [string, any]) => {
      const id = generateId();

      // Handle array definitions [{ type: 'String' }] or ['String']
      let isArray = false;
      let fieldDef = definition;

      if (Array.isArray(definition)) {
        isArray = true;
        fieldDef = definition[0];
        if (typeof fieldDef === 'string') {
          fieldDef = { type: fieldDef };
        }
      }

      // Handle shorthand 'String' definitions
      if (typeof fieldDef === 'string') {
        return {
          id,
          name,
          type: fieldDef as FieldType,
          isArray,
        };
      }

      // Handle nested objects (Group)
      if (typeof fieldDef === 'object' && !fieldDef.type) {
        return {
          id,
          name,
          type: 'Group' as FieldType,
          isArray,
          fields: extractFieldsFromSchema(fieldDef),
        };
      }

      // Handle Relation type
      if (fieldDef.type === 'Relation') {
        return {
          id,
          name,
          type: 'Relation' as FieldType,
          required: fieldDef.required,
          unique: fieldDef.unique,
          select: fieldDef.select,
          default: fieldDef.default,
          description: fieldDef.description,
          isArray,
          relatedModel: fieldDef.model,
        };
      }

      // Handle Enum type
      if (fieldDef.type === 'Enum') {
        return {
          id,
          name,
          type: 'Enum' as FieldType,
          required: fieldDef.required,
          unique: fieldDef.unique,
          select: fieldDef.select,
          default: fieldDef.default,
          description: fieldDef.description,
          isArray,
          enumValues: fieldDef.enumValues,
        };
      }

      // Standard field
      return {
        id,
        name,
        type: (fieldDef.type || 'String') as FieldType,
        required: fieldDef.required,
        unique: fieldDef.unique,
        select: fieldDef.select,
        default: fieldDef.default,
        description: fieldDef.description,
        isArray,
      };
    }
  );
}

export function SchemaEditor({
  schema,
  availableModels,
  onSave,
  onCancel,
}: SchemaEditorProps) {
  const isNewSchema = !schema;
  const [schemaName, setSchemaName] = React.useState(schema?.name || '');
  const [fields, setFields] = React.useState<FormField[]>(() =>
    schema ? extractFieldsFromSchema(schema.fields) : []
  );
  const [showPreview, setShowPreview] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Check if schema is extension-only
  const isExtensionOnly = Boolean(
    schema && schema.ownerModule !== 'database' && schema.ownerModule !== ''
  );

  const handleFieldsChange = (newFields: FormField[]) => {
    setFields(newFields);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!schemaName.trim()) {
      toast({ title: 'Schema name is required', variant: 'destructive' });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: 'At least one field is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate field names
    const invalidFields = fields.filter(f => !f.name.trim());
    if (invalidFields.length > 0) {
      toast({ title: 'All fields must have a name', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const fieldsObject = transformFieldsForApi(fields);

      if (isNewSchema) {
        const result = await createSchema({
          name: schemaName,
          fields: fieldsObject,
          modelOptions: {
            conduit: {
              cms: {
                enabled: true,
                crudOperations: {
                  create: { enabled: true, authenticated: false },
                  read: { enabled: true, authenticated: false },
                  update: { enabled: true, authenticated: false },
                  delete: { enabled: true, authenticated: false },
                },
              },
            },
          },
        });
        toast({ title: 'Schema created successfully' });
        onSave?.(result);
      } else {
        await patchSchema(schema._id, {
          fields: fieldsObject,
        });
        toast({ title: 'Schema updated successfully' });
        setHasChanges(false);
        onSave?.();
      }
    } catch (error: any) {
      toast({
        title: error.message || 'Failed to save schema',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-4">
            {isNewSchema && (
              <div className="flex items-center gap-2">
                <Label htmlFor="schemaName" className="sr-only">
                  Schema Name
                </Label>
                <Input
                  id="schemaName"
                  placeholder="Enter schema name..."
                  value={schemaName}
                  onChange={e => {
                    setSchemaName(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-64 font-medium"
                />
              </div>
            )}
            {!isNewSchema && (
              <h2 className="text-lg font-semibold">{schema.name}</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} JSON
            </Button>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || (!hasChanges && !isNewSchema)}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving
                ? 'Saving...'
                : isNewSchema
                  ? 'Create Schema'
                  : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Extension-only warning */}
        {isExtensionOnly && schema && (
          <Alert className="mx-6 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This schema is owned by {schema.ownerModule}. You can only modify
              extension fields.
            </AlertDescription>
          </Alert>
        )}

        {/* Fields Table */}
        <div className="flex-1 overflow-hidden flex">
          <ScrollArea className="flex-1">
            <div className="p-6">
              <FieldsTable
                fields={fields}
                onFieldsChange={handleFieldsChange}
                availableModels={availableModels}
                disabled={isExtensionOnly}
              />
            </div>
          </ScrollArea>

          {/* JSON Preview Panel */}
          {showPreview && (
            <div className="w-96 border-l bg-muted/30">
              <SchemaPreview
                schemaName={schemaName}
                fields={transformFieldsForApi(fields)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
