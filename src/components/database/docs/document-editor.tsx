'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/lib/hooks/use-toast';
import { updateSchemaDocument } from '@/lib/api/database';
import { DeclaredSchema } from '@/lib/models/database';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw,
  Lock,
  Shield,
} from 'lucide-react';

// Form input components
import { InputField } from '@/components/ui/form-inputs/InputField';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { FormDatePickerField } from '@/components/ui/form-inputs/FormDatePickerField';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import MultiSelectField from '@/components/ui/form-inputs/MultiSelectField';
import { RelationFieldInput } from '@/components/database/docs/relation-field-input';

interface DocumentEditorProps {
  document: any;
  schema: DeclaredSchema;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FieldConfig {
  name: string;
  type: string;
  required: boolean;
  enum?: string[];
  default?: any;
  description?: string;
  relatedModel?: string;
  isArray?: boolean;
  isNestedObject?: boolean;
  nestedFields?: any;
  isExtensionField?: boolean;
}

interface PendingField {
  name: string;
  value: any;
  config: FieldConfig;
}

interface PendingDeletion {
  fieldName: string;
}

interface PermissionAnalysis {
  canEdit: boolean;
  canAddFields: boolean;
  canDeleteFields: boolean;
  canModifyExistingFields: boolean;
  canModifyExtensionFields: boolean;
  restrictedFields: string[];
  extensionFields: string[];
  permissionLevel: 'Everything' | 'Nothing' | 'ExtensionOnly';
}

// Utility function to analyze schema permissions
const analyzePermissions = (schema: DeclaredSchema): PermissionAnalysis => {
  const permissions = schema.modelOptions?.conduit?.permissions;
  const isDatabaseModule = schema.ownerModule === 'database';

  // If database module owns the schema, full permissions
  if (isDatabaseModule) {
    return {
      canEdit: true,
      canAddFields: true,
      canDeleteFields: true,
      canModifyExistingFields: true,
      canModifyExtensionFields: true,
      restrictedFields: [],
      extensionFields: [],
      permissionLevel: 'Everything',
    };
  }

  // Get extension fields from schema extensions
  const extensionFields =
    schema.extensions?.flatMap(ext => Object.keys(ext.fields || {})) || [];

  if (!permissions) {
    return {
      canEdit: false,
      canAddFields: false,
      canDeleteFields: false,
      canModifyExistingFields: false,
      canModifyExtensionFields: false,
      restrictedFields: Object.keys(schema.compiledFields || {}),
      extensionFields,
      permissionLevel: 'Nothing',
    };
  }

  const canModify = permissions.canModify || 'Nothing';
  const canCreate = permissions.canCreate || false;
  const canDelete = permissions.canDelete || false;
  const extendable = permissions.extendable || false;

  let canModifyExistingFields = false;
  let canModifyExtensionFields = false;
  let restrictedFields: string[] = [];

  switch (canModify) {
    case 'Everything':
      canModifyExistingFields = true;
      canModifyExtensionFields = true;
      break;
    case 'ExtensionOnly':
      canModifyExtensionFields = true;
      // Core fields are restricted
      restrictedFields = Object.keys(schema.compiledFields || {}).filter(
        field => !extensionFields.includes(field)
      );
      break;
    case 'Nothing':
    default:
      // All fields are restricted
      restrictedFields = Object.keys(schema.compiledFields || {});
      break;
  }

  return {
    canEdit: canModify !== 'Nothing',
    canAddFields: extendable && canCreate,
    canDeleteFields: canDelete,
    canModifyExistingFields,
    canModifyExtensionFields,
    restrictedFields,
    extensionFields,
    permissionLevel: canModify,
  };
};

// Utility function to check if a field is an extension field
const isExtensionField = (
  fieldName: string,
  schema: DeclaredSchema
): boolean => {
  return (
    schema.extensions?.some(ext =>
      Object.keys(ext.fields || {}).includes(fieldName)
    ) || false
  );
};

export function DocumentEditor({
  document,
  schema,
  open,
  onOpenChange,
}: DocumentEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [pendingFields, setPendingFields] = useState<PendingField[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>(
    []
  );
  const [addingField, setAddingField] = useState<FieldConfig | null>(null);
  const [addingFieldValue, setAddingFieldValue] = useState<any>('');

  // Separate form for add field dialog
  const addFieldForm = useForm();

  // Analyze permissions
  const permissions = useMemo(() => analyzePermissions(schema), [schema]);

  // Parse schema fields to get field configurations
  useEffect(() => {
    if (schema && schema.compiledFields) {
      const configs: FieldConfig[] = [];

      Object.entries(schema.compiledFields).forEach(
        ([fieldName, fieldConfig]: [string, any]) => {
          if (
            fieldName === '_id' ||
            fieldName === '__v' ||
            fieldName === 'createdAt' ||
            fieldName === 'updatedAt'
          ) {
            return; // Skip system fields
          }

          const isExtension = isExtensionField(fieldName, schema);

          // Check if this is a nested object (has properties but no type)
          if (
            fieldConfig &&
            typeof fieldConfig === 'object' &&
            !fieldConfig.type &&
            !fieldConfig.required &&
            !fieldConfig.default
          ) {
            // This is a nested object structure
            configs.push({
              name: fieldName,
              type: 'JSON',
              required: false,
              isArray: false,
              isNestedObject: true,
              nestedFields: fieldConfig,
              isExtensionField: isExtension,
            });
          } else {
            // This is a regular field
            configs.push({
              name: fieldName,
              type: fieldConfig.type || 'string',
              required: fieldConfig.required || false,
              enum: fieldConfig.enum,
              default: fieldConfig.default,
              description: fieldConfig.description,
              relatedModel: fieldConfig.relatedModel || fieldConfig.model, // Support both relatedModel and model
              isArray: fieldConfig.isArray || false,
              isExtensionField: isExtension,
            });
          }
        }
      );

      setFieldConfigs(configs);
    }
  }, [schema]);

  // Create form with all fields
  const form = useForm<any>({
    mode: 'onChange',
    defaultValues: {},
  });

  // Reset form when fieldConfigs or document changes
  useEffect(() => {
    if (fieldConfigs.length > 0) {
      const defaults: any = {};

      // Add existing document fields
      fieldConfigs.forEach(field => {
        if (document[field.name] !== undefined) {
          // Handle special data types
          let value = document[field.name];

          // Parse dates
          if (field.type === 'Date' || field.type === 'date') {
            if (value) {
              if (typeof value === 'string') {
                value = new Date(value);
              } else if (value && typeof value === 'object' && value.$date) {
                // Handle MongoDB date format
                value = new Date(value.$date);
              } else if (value instanceof Date) {
                // Already a Date object
                value = value;
              }
            }
          }

          // Handle ObjectId values (convert from MongoDB format)
          if (value && typeof value === 'object' && value.$oid) {
            value = value.$oid;
          }

          // Handle arrays
          if (field.isArray && !Array.isArray(value)) {
            value = value ? [value] : [];
          }

          // Handle nested objects - ensure they're properly formatted as JSON strings
          if (field.isNestedObject && value && typeof value === 'object') {
            value = JSON.stringify(value, null, 2);
          }

          defaults[field.name] = value;
        } else if (field.default !== undefined) {
          defaults[field.name] = field.default;
        } else {
          // Set appropriate default based on type
          switch (field.type) {
            case 'String':
            case 'string':
              defaults[field.name] = '';
              break;
            case 'Number':
            case 'number':
              defaults[field.name] = 0;
              break;
            case 'Boolean':
            case 'boolean':
              defaults[field.name] = false;
              break;
            case 'Array':
            case 'array':
              defaults[field.name] = [];
              break;
            case 'JSON':
            case 'object':
              if (field.isNestedObject) {
                // For nested objects, provide a template based on the nested fields
                const template: any = {};
                if (field.nestedFields) {
                  Object.keys(field.nestedFields).forEach(nestedField => {
                    const nestedConfig = field.nestedFields[nestedField];
                    if (nestedConfig.type === 'String')
                      template[nestedField] = '';
                    else if (nestedConfig.type === 'Number')
                      template[nestedField] = 0;
                    else if (nestedConfig.type === 'Boolean')
                      template[nestedField] = false;
                    else if (nestedConfig.type === 'Date')
                      template[nestedField] = null;
                    else template[nestedField] = '';
                  });
                }
                defaults[field.name] = JSON.stringify(template, null, 2);
              } else {
                defaults[field.name] = {};
              }
              break;
            case 'Date':
            case 'date':
              defaults[field.name] = null;
              break;
            default:
              defaults[field.name] = '';
          }
        }
      });

      // Add pending fields
      pendingFields.forEach(pendingField => {
        let value = pendingField.value;

        // Apply the same processing as regular fields
        if (
          pendingField.config.type === 'Date' ||
          pendingField.config.type === 'date'
        ) {
          if (value) {
            if (typeof value === 'string') {
              value = new Date(value);
            } else if (value && typeof value === 'object' && value.$date) {
              value = new Date(value.$date);
            } else if (value instanceof Date) {
              value = value;
            }
          }
        }

        // Handle ObjectId values
        if (value && typeof value === 'object' && value.$oid) {
          value = value.$oid;
        }

        defaults[pendingField.name] = value;
      });

      form.reset(defaults);
    }
  }, [fieldConfigs, document, form, pendingFields, document._id]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Check if editing is allowed
      if (!permissions.canEdit) {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to edit this document.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Filter out unchanged values and system fields
      const updatedData: any = {};
      let hasChanges = false;

      // Process existing fields
      fieldConfigs.forEach(field => {
        // Skip if field is marked for deletion
        if (pendingDeletions.some(pd => pd.fieldName === field.name)) {
          return;
        }

        // Check if field modification is allowed
        if (!canModifyField(field)) {
          return;
        }

        const currentValue = document[field.name];
        let newValue = data[field.name];

        // Parse JSON strings back to objects for nested objects
        if (field.isNestedObject && typeof newValue === 'string') {
          try {
            newValue = JSON.parse(newValue);
          } catch (error) {
            console.warn(
              `Failed to parse JSON for field ${field.name}:`,
              error
            );
            // Keep as string if parsing fails
          }
        }

        // Check if value has changed
        if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          updatedData[field.name] = newValue;
          hasChanges = true;
        }
      });

      // Add pending fields (only if allowed)
      if (permissions.canAddFields) {
        pendingFields.forEach(pendingField => {
          let value = pendingField.value;

          // Parse JSON strings back to objects for nested objects
          if (pendingField.config.isNestedObject && typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch (error) {
              console.warn(
                `Failed to parse JSON for pending field ${pendingField.name}:`,
                error
              );
            }
          }

          updatedData[pendingField.name] = value;
          hasChanges = true;
        });
      }

      // Check if there are any pending deletions (only if allowed)
      if (pendingDeletions.length > 0 && permissions.canDeleteFields) {
        hasChanges = true;
      }

      if (!hasChanges) {
        toast({
          title: 'No Changes',
          description: 'No changes were made to the document.',
        });
        setIsSubmitting(false);
        return;
      }

      await updateSchemaDocument(schema.name, document._id, updatedData);

      toast({
        title: 'Success',
        description: 'Document updated successfully.',
      });

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update document.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = (field: FieldConfig) => {
    const fieldName = field.name;
    const isRequired = field.required;
    const canModify = canModifyField(field);

    const commonProps = {
      fieldName,
      label: field.name,
      placeholder: `Enter ${field.name}`,
      required: isRequired,
      description: field.description,
      disabled: !canModify,
    };

    switch (field.type) {
      case 'String':
      case 'string':
        if (field.enum) {
          return (
            <SelectField
              {...commonProps}
              options={field.enum.map(value => ({ label: value, value }))}
            />
          );
        }
        return <InputField {...commonProps} />;

      case 'Number':
      case 'number':
        return <InputField {...commonProps} type="number" />;

      case 'Boolean':
      case 'boolean':
        return <SwitchField {...commonProps} />;

      case 'Date':
      case 'date':
        const dateValue = form.watch(field.name);
        return <FormDatePickerField {...commonProps} />;

      case 'Array':
      case 'array':
        if (field.enum) {
          return (
            <MultiSelectField
              {...commonProps}
              options={field.enum.map(value => ({ label: value, value }))}
            />
          );
        }
        return <TextAreaField {...commonProps} />;

      case 'JSON':
      case 'object':
        if (field.isNestedObject) {
          const nestedFields = Object.keys(field.nestedFields || {}).join(', ');
          return (
            <CodeField
              {...commonProps}
              language="json"
              placeholder={`Enter JSON object with fields: ${nestedFields}`}
            />
          );
        }
        return (
          <CodeField
            {...commonProps}
            language="json"
            placeholder="Enter JSON object"
          />
        );

      case 'Relation':
        const relationValue = form.watch(field.name);
        return (
          <RelationFieldInput
            {...commonProps}
            relatedModel={field.relatedModel}
            isArray={field.isArray}
            control={form.control}
            value={relationValue}
          />
        );

      case 'ObjectId':
        return <InputField {...commonProps} placeholder="Enter ObjectId" />;

      default:
        return <InputField {...commonProps} />;
    }
  };

  const canDeleteField = (field: FieldConfig) => {
    // Check if field deletion is allowed by permissions
    if (!permissions.canDeleteFields) {
      return false;
    }

    return (
      !field.required &&
      (document[field.name] !== undefined ||
        pendingFields.some(pf => pf.name === field.name))
    );
  };

  const canModifyField = (field: FieldConfig) => {
    if (permissions.permissionLevel === 'Everything') {
      return true;
    }

    if (permissions.permissionLevel === 'ExtensionOnly') {
      return field.isExtensionField;
    }

    return false;
  };

  const canAddNewField = (field: FieldConfig) => {
    return permissions.canAddFields;
  };

  const deleteField = (fieldName: string) => {
    const field = fieldConfigs.find(f => f.name === fieldName);
    if (field && canDeleteField(field)) {
      // Mark for deletion instead of immediately deleting
      setPendingDeletions(prev => [...prev, { fieldName }]);

      // Remove from pending fields if it was there
      setPendingFields(prev => prev.filter(pf => pf.name !== fieldName));

      toast({
        title: 'Field Marked for Deletion',
        description: `Field "${fieldName}" will be deleted when you save the document.`,
      });
    }
  };

  const addMissingField = (field: FieldConfig) => {
    setAddingField(field);
    setAddingFieldValue('');
  };

  const confirmAddField = () => {
    if (
      addingField &&
      addingFieldValue !== undefined &&
      addingFieldValue !== ''
    ) {
      setPendingFields(prev => [
        ...prev,
        {
          name: addingField.name,
          value: addingFieldValue,
          config: addingField,
        },
      ]);

      toast({
        title: 'Field Added',
        description: `Field "${addingField.name}" will be added when you save the document.`,
      });

      setAddingField(null);
      setAddingFieldValue('');
    }
  };

  const cancelAddField = () => {
    setAddingField(null);
    setAddingFieldValue('');
  };

  const isFieldPendingDeletion = (fieldName: string) => {
    return pendingDeletions.some(pd => pd.fieldName === fieldName);
  };

  const isFieldPendingAddition = (fieldName: string) => {
    return pendingFields.some(pf => pf.name === fieldName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Document
          </DialogTitle>
          <DialogDescription>
            Edit the entire document with schema-aware field validation.
          </DialogDescription>

          {/* Permission Status */}
          {!permissions.canEdit && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You do not have permission to edit this document. This schema is
                owned by the &quot;{schema.ownerModule}&quot; module.
              </AlertDescription>
            </Alert>
          )}

          {permissions.canEdit &&
            permissions.permissionLevel !== 'Everything' && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Limited editing permissions:{' '}
                  {permissions.permissionLevel === 'ExtensionOnly'
                    ? 'You can only modify extension fields'
                    : 'Some fields are restricted'}
                </AlertDescription>
              </Alert>
            )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] border rounded-md">
              <div className="space-y-6 pr-4 pb-4">
                {/* Existing Fields */}
                {fieldConfigs
                  .filter(
                    field =>
                      document[field.name] !== undefined &&
                      !isFieldPendingDeletion(field.name)
                  )
                  .map(field => (
                    <Card
                      key={field.name}
                      className="border-l-4 border-l-primary"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              {field.name}
                            </CardTitle>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.isExtensionField && (
                              <Badge variant="secondary" className="text-xs">
                                Extension
                              </Badge>
                            )}
                            {!canModifyField(field) && (
                              <Badge variant="destructive" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Restricted
                              </Badge>
                            )}
                          </div>
                          {canDeleteField(field) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteField(field.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {field.description && (
                          <CardDescription>{field.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>{renderFieldInput(field)}</CardContent>
                    </Card>
                  ))}

                {/* Pending Fields */}
                {pendingFields.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-medium text-blue-600">
                          Fields to be Added
                        </h3>
                      </div>

                      {pendingFields.map(pendingField => (
                        <Card
                          key={pendingField.name}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">
                                  {pendingField.name}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {pendingField.config.type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Pending
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPendingFields(prev =>
                                    prev.filter(
                                      pf => pf.name !== pendingField.name
                                    )
                                  )
                                }
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {renderFieldInput(pendingField.config)}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* Pending Deletions */}
                {pendingDeletions.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-medium text-red-600">
                          Fields to be Deleted
                        </h3>
                      </div>

                      {pendingDeletions.map(pendingDeletion => {
                        const field = fieldConfigs.find(
                          f => f.name === pendingDeletion.fieldName
                        );
                        return (
                          <Card
                            key={pendingDeletion.fieldName}
                            className="border-l-4 border-l-red-500 opacity-60"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">
                                    {pendingDeletion.fieldName}
                                  </CardTitle>
                                  {field && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {field.type}
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    To be deleted
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setPendingDeletions(prev =>
                                      prev.filter(
                                        pd =>
                                          pd.fieldName !==
                                          pendingDeletion.fieldName
                                      )
                                    )
                                  }
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Missing Fields */}
                {fieldConfigs.filter(
                  field =>
                    document[field.name] === undefined &&
                    !isFieldPendingAddition(field.name)
                ).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Available Fields (Not in Document)
                        </h3>
                      </div>

                      {fieldConfigs
                        .filter(field => document[field.name] === undefined)
                        .map(field => (
                          <Card
                            key={field.name}
                            className="border-l-4 border-l-muted"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">
                                    {field.name}
                                  </CardTitle>
                                  {field.required && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Required
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {field.type}
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addMissingField(field)}
                                  disabled={!canAddNewField(field)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Field
                                </Button>
                              </div>
                              {field.description && (
                                <CardDescription>
                                  {field.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  {fieldConfigs.filter(f => f.required).length} required fields
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !permissions.canEdit}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Add Field Dialog */}
      <Dialog
        open={!!addingField}
        onOpenChange={open => !open && cancelAddField()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Field: {addingField?.name}</DialogTitle>
            <DialogDescription>
              Provide a value for the field &quot;{addingField?.name}&quot; (
              {addingField?.type}).
            </DialogDescription>
          </DialogHeader>

          <Form {...addFieldForm}>
            <div className="space-y-4">
              {addingField && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  {addingField.type === 'Boolean' ||
                  addingField.type === 'boolean' ? (
                    <SwitchField
                      fieldName="tempValue"
                      label=""
                      checked={addingFieldValue}
                      onCheckedChange={setAddingFieldValue}
                    />
                  ) : addingField.type === 'JSON' ||
                    addingField.type === 'object' ? (
                    <CodeField
                      fieldName="tempValue"
                      label=""
                      placeholder="Enter JSON value"
                      language="json"
                      value={addingFieldValue}
                      onChange={e => setAddingFieldValue(e.target.value)}
                    />
                  ) : addingField.type === 'Date' ||
                    addingField.type === 'date' ? (
                    <FormDatePickerField fieldName="tempValue" label="" />
                  ) : (
                    <InputField
                      fieldName="tempValue"
                      label=""
                      type={
                        addingField.type === 'Number' ||
                        addingField.type === 'number'
                          ? 'number'
                          : 'text'
                      }
                      value={addingFieldValue}
                      onChange={e => setAddingFieldValue(e.target.value)}
                    />
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelAddField}>
                  Cancel
                </Button>
                <Button onClick={confirmAddField} disabled={!addingFieldValue}>
                  Add Field
                </Button>
              </div>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
