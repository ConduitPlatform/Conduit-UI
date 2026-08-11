'use client';

import * as React from 'react';
import { DeclaredSchema } from '@/lib/models/database';
import { updateSchemaDocument, createSchemaDocument } from '@/lib/api/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save, Copy, Check, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/hooks/use-toast';
import moment from 'moment';
import { RelationFieldInput } from './relation-field-input';
import type { ModelDataPermissions } from './permissions';

type DocumentPanelProps = {
  schema: DeclaredSchema;
  document: any | null;
  isNew: boolean;
  permissions: ModelDataPermissions;
  onSave: () => void;
  onClose: () => void;
};

type FieldDefinition = {
  name: string;
  type: string;
  required?: boolean;
  isArray?: boolean;
  enumValues?: string[];
  model?: string;
  isExtensionField?: boolean;
};

function extractFieldDefinitions(schema: DeclaredSchema): FieldDefinition[] {
  const extensionFields = new Set(
    schema.extensions?.flatMap(extension =>
      Object.keys(extension.fields ?? {})
    ) ?? []
  );
  const schemaFields = {
    ...(schema.compiledFields || schema.fields || {}),
    ...(schema.extensions ?? []).reduce<Record<string, any>>(
      (fields, extension) => ({ ...fields, ...(extension.fields ?? {}) }),
      {}
    ),
  };
  if (Object.keys(schemaFields).length === 0) return [];

  return Object.entries(schemaFields).map(
    ([name, definition]: [string, any]) => {
      let isArray = false;
      let fieldDef = definition;

      if (Array.isArray(definition)) {
        isArray = true;
        fieldDef = definition[0];
        if (typeof fieldDef === 'string') {
          fieldDef = { type: fieldDef };
        }
      }

      if (typeof fieldDef === 'string') {
        return {
          name,
          type: fieldDef,
          isArray,
          isExtensionField: extensionFields.has(name),
        };
      }

      if (typeof fieldDef === 'object' && !fieldDef.type) {
        return {
          name,
          type: 'Group',
          isArray,
          isExtensionField: extensionFields.has(name),
        };
      }

      return {
        name,
        type: fieldDef.type || 'String',
        required: fieldDef.required,
        isArray,
        enumValues: fieldDef.enumValues,
        model: fieldDef.model,
        isExtensionField: extensionFields.has(name),
      };
    }
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '';

  if (typeof value === 'object') {
    if (value.$date) {
      return moment(value.$date).format('YYYY-MM-DDTHH:mm');
    }
    if (value.$oid) {
      return value.$oid;
    }
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function parseValue(value: any, type: string): any {
  if (value === '' || value === null || value === undefined) return null;

  // If value is already the right type (e.g., for relations), return as-is
  if (typeof value !== 'string') return value;

  switch (type) {
    case 'Number':
      return Number(value);
    case 'Boolean':
      return value === 'true';
    case 'Date':
      return value;
    case 'JSON':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

export function DocumentPanel({
  schema,
  document,
  isNew,
  permissions,
  onSave,
  onClose,
}: DocumentPanelProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);

  const fieldDefinitions = React.useMemo(
    () => extractFieldDefinitions(schema),
    [schema]
  );

  // Initialize form data from document or empty for new
  React.useEffect(() => {
    if (document) {
      const data: Record<string, any> = {};
      fieldDefinitions.forEach(field => {
        data[field.name] = document[field.name];
      });
      setFormData(data);
    } else {
      // For new documents, initialize with empty values
      const data: Record<string, any> = {};
      fieldDefinitions.forEach(field => {
        if (field.type === 'Boolean') {
          data[field.name] = false;
        } else if (field.isArray) {
          data[field.name] = [];
        } else {
          data[field.name] = null;
        }
      });
      setFormData(data);
    }
  }, [document, fieldDefinitions]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async () => {
    if (isNew && !permissions.canCreate) {
      toast({
        title: 'Create not allowed',
        description: 'This model does not allow document creation.',
        variant: 'destructive',
      });
      return;
    }

    if (!isNew && !permissions.canEdit) {
      toast({
        title: 'Edit not allowed',
        description: 'This model does not allow document editing.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        // Create new document
        const newDoc: Record<string, any> = {};
        fieldDefinitions.forEach(field => {
          const value = formData[field.name];
          if (value !== null && value !== undefined && value !== '') {
            newDoc[field.name] = parseValue(value, field.type);
          }
        });

        await createSchemaDocument(schema.name, newDoc);
        toast({ title: 'Document created successfully' });
        onSave();
      } else {
        // Update existing document
        if (!document?._id) {
          toast({
            title: 'Cannot save: document has no ID',
            variant: 'destructive',
          });
          return;
        }

        // Only send changed fields
        const changes: Record<string, any> = {};
        fieldDefinitions.forEach(field => {
          const newValue = formData[field.name];
          const oldValue = document[field.name];
          if (
            permissions.canModifyField(field.name) &&
            JSON.stringify(newValue) !== JSON.stringify(oldValue)
          ) {
            changes[field.name] = parseValue(newValue, field.type);
          }
        });

        if (Object.keys(changes).length === 0) {
          toast({ title: 'No changes to save' });
          return;
        }

        await updateSchemaDocument(schema.name, document._id, changes);
        toast({ title: 'Document updated' });
        onSave();
      }
    } catch (error: any) {
      toast({
        title: error.message || 'Failed to save document',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyId = async () => {
    if (document?._id) {
      await navigator.clipboard.writeText(document._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.name];
    const canModifyField = isNew || permissions.canModifyField(field.name);

    // Relation field - use searchable picker
    if (field.type === 'Relation' && field.model) {
      return (
        <RelationFieldInput
          value={value}
          onChange={v => handleChange(field.name, v)}
          relatedModel={field.model}
          isArray={field.isArray}
          disabled={!canModifyField}
        />
      );
    }

    // Enum field
    if (field.enumValues && field.enumValues.length > 0) {
      return (
        <Select
          value={String(value ?? '')}
          onValueChange={v => handleChange(field.name, v)}
          disabled={!canModifyField}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.enumValues.map(enumValue => (
              <SelectItem key={enumValue} value={enumValue}>
                {enumValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Boolean field
    if (field.type === 'Boolean') {
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={Boolean(value)}
            onCheckedChange={checked => handleChange(field.name, checked)}
            disabled={!canModifyField}
          />
          <span className="text-sm text-muted-foreground">
            {value ? 'true' : 'false'}
          </span>
        </div>
      );
    }

    // Date field
    if (field.type === 'Date') {
      return (
        <Input
          type="datetime-local"
          value={formatValue(value)}
          onChange={e => handleChange(field.name, e.target.value)}
          disabled={!canModifyField}
        />
      );
    }

    // Number field
    if (field.type === 'Number') {
      return (
        <Input
          type="number"
          value={
            typeof value === 'number' || typeof value === 'string' ? value : ''
          }
          onChange={e => handleChange(field.name, e.target.value)}
          disabled={!canModifyField}
        />
      );
    }

    // JSON/Object field
    if (
      field.type === 'JSON' ||
      field.type === 'Group' ||
      (typeof value === 'object' && value !== null)
    ) {
      return (
        <Textarea
          value={formatValue(value)}
          onChange={e => handleChange(field.name, e.target.value)}
          rows={4}
          className="font-mono text-xs"
          disabled={!canModifyField}
        />
      );
    }

    // Default string field
    return (
      <Input
        value={value ?? ''}
        onChange={e => handleChange(field.name, e.target.value)}
        disabled={!canModifyField}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">
            {isNew ? 'New Document' : 'Edit Document'}
          </h3>
          {document?._id && (
            <Badge
              variant="outline"
              className="font-mono text-xs cursor-pointer"
              onClick={handleCopyId}
            >
              {copiedId ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {document._id.substring(0, 8)}...
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Read-only system fields (only for existing documents) */}
          {document && (
            <Card className="bg-muted/30">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">System Fields</CardTitle>
              </CardHeader>
              <CardContent className="py-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">_id</span>
                  <span className="font-mono text-xs">{document._id}</span>
                </div>
                {document.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-xs">
                      {moment(document.createdAt).format('MMM D, YYYY HH:mm')}
                    </span>
                  </div>
                )}
                {document.updatedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-xs">
                      {moment(document.updatedAt).format('MMM D, YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!isNew && <Separator />}

          {/* Editable fields */}
          {fieldDefinitions.map(field => (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor={field.name} className="font-medium">
                  {field.name}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  {field.type}
                </Badge>
                {field.isArray && (
                  <Badge variant="outline" className="text-xs">
                    Array
                  </Badge>
                )}
                {field.isExtensionField && (
                  <Badge variant="outline" className="text-xs">
                    Extension
                  </Badge>
                )}
                {!isNew && !permissions.canModifyField(field.name) && (
                  <Badge variant="outline" className="text-xs">
                    Read-only
                  </Badge>
                )}
                {field.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {field.model && (
                  <Badge variant="outline" className="text-xs">
                    → {field.model}
                  </Badge>
                )}
              </div>
              {renderField(field)}
            </div>
          ))}

          {fieldDefinitions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No editable fields defined in schema.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            isSaving || (isNew ? !permissions.canCreate : !permissions.canEdit)
          }
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isNew ? (
            <Plus className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : isNew ? 'Create Document' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
