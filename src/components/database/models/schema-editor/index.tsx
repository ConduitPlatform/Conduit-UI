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
import { Save, Code, AlertCircle, Info, Loader2 } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Badge } from '@/components/ui/badge';
import { FieldType } from './type-picker';

type SchemaEditorProps = {
  schema: DeclaredSchema | null;
  availableModels: string[];
  onSave?: (schema?: DeclaredSchema) => void;
  onCancel?: () => void;
  created?: boolean;
  onOpenSettings?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function validateFields(
  fieldsToValidate: FormField[],
  parentPath = '',
  depth = 0
): string | null {
  const names = new Set<string>();

  for (const field of fieldsToValidate) {
    const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;

    if (!field.name.trim()) {
      return parentPath
        ? `Every nested field in ${parentPath} needs a name.`
        : 'Every field needs a name.';
    }

    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(field.name.trim())) {
      return `${fieldPath} must start with a letter and only use letters, numbers, or underscores.`;
    }

    if (names.has(field.name)) {
      return `${fieldPath} is duplicated. Field names must be unique at each level.`;
    }
    names.add(field.name);

    if (field.unique && !field.required) {
      return `${fieldPath} is unique, so it must also be required.`;
    }

    if (field.type === 'Relation' && !field.relatedModel) {
      return `${fieldPath} is a relation and needs a related model.`;
    }

    if (field.type === 'Group') {
      if (depth >= 1) {
        return `Nested groups are only supported up to 1 level deep. ${fieldPath} exceeds this limit.`;
      }
      if (!field.fields?.length) {
        return `${fieldPath} is a nested group and needs at least one nested field.`;
      }
      const nestedError = validateFields(field.fields, fieldPath, depth + 1);
      if (nestedError) return nestedError;
    }
  }

  return null;
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
  created = false,
  onOpenSettings,
  onDirtyChange,
}: SchemaEditorProps) {
  const isNewSchema = !schema;
  const [schemaName, setSchemaName] = React.useState(schema?.name || '');
  const [fields, setFields] = React.useState<FormField[]>(() =>
    schema ? extractFieldsFromSchema(schema.fields) : []
  );
  const [initialSignature, setInitialSignature] = React.useState(() =>
    JSON.stringify(transformFieldsForApi(fields))
  );
  const [showPreview, setShowPreview] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveShortcutLabel, setSaveShortcutLabel] = React.useState('Ctrl+S');
  const [removedFieldsToConfirm, setRemovedFieldsToConfirm] = React.useState<
    string[]
  >([]);

  React.useEffect(() => {
    const nextFields = schema ? extractFieldsFromSchema(schema.fields) : [];
    setSchemaName(schema?.name || '');
    setFields(nextFields);
    setInitialSignature(JSON.stringify(transformFieldsForApi(nextFields)));
  }, [schema]);

  const currentSignature = React.useMemo(
    () => JSON.stringify(transformFieldsForApi(fields)),
    [fields]
  );

  const hasChanges = isNewSchema
    ? Boolean(schemaName.trim()) || fields.length > 0
    : currentSignature !== initialSignature;

  React.useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);

  // Check if schema is extension-only
  const isExtensionOnly = Boolean(
    schema && schema.ownerModule !== 'database' && schema.ownerModule !== ''
  );

  const handleFieldsChange = (newFields: FormField[]) => {
    setFields(newFields);
  };

  const getRemovedFieldNames = React.useCallback(() => {
    if (!schema) return [];

    const initialNames = new Set(Object.keys(schema.fields || {}));
    const currentNames = new Set(fields.map(field => field.name));

    return Array.from(initialNames).filter(name => !currentNames.has(name));
  }, [fields, schema]);

  const performSave = React.useCallback(async () => {
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

    const validationError = validateFields(fields);
    if (validationError) {
      toast({
        title: 'Fix schema fields before saving',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const fieldsObject = transformFieldsForApi(fields);

      if (isNewSchema) {
        const result = await createSchema({
          name: schemaName,
          fields: fieldsObject,
          conduitOptions: {
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
        });
        toast({ title: 'Schema created successfully' });
        onSave?.(result);
      } else {
        await patchSchema(schema._id, {
          fields: fieldsObject,
        });
        toast({ title: 'Schema updated successfully' });
        setInitialSignature(JSON.stringify(fieldsObject));
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
  }, [fields, isNewSchema, onSave, schema?._id, schemaName]);

  const handleSave = React.useCallback(async () => {
    const removedFields = getRemovedFieldNames();
    if (!isNewSchema && removedFields.length > 0) {
      setRemovedFieldsToConfirm(removedFields);
      return;
    }

    await performSave();
  }, [getRemovedFieldNames, isNewSchema, performSave]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key === 's';
      if (!isSaveShortcut) return;

      event.preventDefault();
      if (!isSaving && hasChanges) {
        void handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, handleSave, isSaving]);

  React.useEffect(() => {
    const platform = navigator.platform || navigator.userAgent;
    setSaveShortcutLabel(
      /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘S' : 'Ctrl+S'
    );
  }, []);

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
                  onChange={e => setSchemaName(e.target.value)}
                  className="w-64 font-medium"
                />
              </div>
            )}
            {!isNewSchema && (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{schema.name}</h2>
                {hasChanges && (
                  <Badge variant="secondary" className="font-normal">
                    Unsaved changes
                  </Badge>
                )}
              </div>
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
              {!isSaving && hasChanges && (
                <kbd className="ml-1 rounded border bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px]">
                  {saveShortcutLabel}
                </kbd>
              )}
            </Button>
          </div>
        </div>

        {created && (
          <Alert className="mx-6 mt-4 border-primary/30 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>
                Model created. Define the fields your data needs, then configure
                CRUD and authorization before opening it up.
              </span>
              {onOpenSettings && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenSettings}
                  className="shrink-0"
                >
                  Open Settings
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

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
                depth={0}
                maxDepth={1}
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

      <AlertDialog
        open={removedFieldsToConfirm.length > 0}
        onOpenChange={open => {
          if (!open) setRemovedFieldsToConfirm([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove fields from this model?</AlertDialogTitle>
            <AlertDialogDescription>
              Saving will remove{' '}
              <strong>{removedFieldsToConfirm.join(', ')}</strong> from the
              schema. Existing documents may no longer expose values stored in
              those fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRemovedFieldsToConfirm([]);
                void performSave();
              }}
            >
              Save and remove fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
