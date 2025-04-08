'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFieldArray, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import * as React from 'react';
import { useEffect } from 'react';
import {
  ArrowLeft,
  BinaryIcon as LogicalOr,
  ChevronDown,
  Code,
  FileJson,
  Filter,
  FormInput,
  Plus,
  PlusIcon as LogicalAnd,
  Save,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/lib/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Assignment,
  AssignmentActionEnum,
  Comparison,
  ComparisonOperationEnum,
  CustomEndpoint,
  LocationEnum,
  OperationsEnum,
  ValueSourceTypeEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import { z } from 'zod';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { getSchemas } from '@/lib/api/database';
import { DeclaredSchema } from '@/lib/models/database';
import SelectField from '@/components/ui/form-inputs/SelectField';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import {
  assignmentOperations,
  comparisonOperations,
  inputTypes,
  operationTypes,
  placementTypes,
  valueSourceTypes,
} from './constants';
import {
  getPlacementIcon,
  getPlacementName,
  getReadableOperation,
  getTypeIcon,
} from '@/components/database/queries/editor/utils';

interface ModelField {
  name: string;
  type: string;
  isArray: boolean;
}

// Replace the existing findConditionSchema with a recursive schema that supports groups
const conditionSchema = z.object({
  schemaField: z.string().min(1, 'Field is required'),
  operation: z.nativeEnum(ComparisonOperationEnum),
  comparisonField: z.object({
    type: z.nativeEnum(ValueSourceTypeEnum),
    inputName: z.string().optional(),
    like: z.boolean().optional(),
    caseSensitiveLike: z.boolean().optional(),
  }),
});

// Create a recursive schema for condition groups
//todo change
const conditionGroupSchema: any = z
  .object({
    AND: z.array(
      z.union([
        conditionSchema,
        z.lazy(() => conditionGroupSchema) as typeof conditionGroupSchema,
      ])
    ),
  })
  .or(
    z.object({
      OR: z.array(
        z.union([
          conditionSchema,
          z.lazy(() => conditionGroupSchema) as typeof conditionGroupSchema,
        ])
      ),
    })
  );

// Define the schema for set conditions
const setConditionSchema = z.object({
  schemaField: z.string().min(1, 'Field is required'),
  action: z.nativeEnum(AssignmentActionEnum),
  assignmentField: z.object({
    type: z.nativeEnum(ValueSourceTypeEnum),
    value: z.string(),
  }),
});

// First, update the querySchema to include the authenticated field
const querySchema = z.object({
  name: z.string().min(1, 'Query name is required'),
  description: z.string().optional(),
  operation: z.nativeEnum(OperationsEnum),
  selectedSchema: z.string().min(1, 'Model is required'),
  selectedSchemaName: z.string(),
  authentication: z.boolean().default(false), // Add this line
  inputs: z.array(
    z.object({
      name: z.string().min(1, 'Input name is required'),
      type: z.nativeEnum(ValueTypeEnum),
      location: z.nativeEnum(LocationEnum),
      optional: z.boolean().default(false),
      array: z.boolean().default(false),
    })
  ),
  inputsJson: z.string().optional(),
  query: conditionGroupSchema.default({
    AND: [],
  }),
  assignments: z.array(setConditionSchema),
  queryJson: z.string().optional(),
});

type QueryFormValues = z.infer<typeof querySchema>;

interface QueryEditorProps {
  onBack?: () => void;
  onSave?: (data: QueryFormValues) => void;
  initialData?: Partial<CustomEndpoint>;
}

export function QueryEditor({
  onBack,
  onSave,
  initialData,
}: Readonly<QueryEditorProps>) {
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [isModelDialogOpen, setIsModelDialogOpen] = React.useState(false);
  const [modelSearchTerm, setModelSearchTerm] = React.useState('');
  const [inputMode, setInputMode] = React.useState<'form' | 'json'>('form');
  const [queryMode, setQueryMode] = React.useState<'form' | 'json'>('form');

  // Update the form defaultValues to include the authenticated field
  const form = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      // description: initialData?.description ?? '',
      operation: initialData?.operation ?? 0,
      selectedSchema: initialData?.selectedSchema ?? undefined,
      selectedSchemaName: initialData?.selectedSchemaName ?? undefined,
      authentication: initialData?.authentication ?? false,
      inputs: initialData?.inputs ?? [],
      inputsJson: initialData?.inputs
        ? JSON.stringify(initialData.inputs)
        : '[]',
      query: initialData?.query ?? {
        AND: [],
      },
      assignments: initialData?.assignments ?? [],
      queryJson: initialData?.query
        ? JSON.stringify({
            query: initialData?.query,
            assignments: initialData?.assignments,
          })
        : JSON.stringify({
            query: { AND: [] },
            assignments: [],
          }),
    },
  });
  const selectedSchema = form.watch('selectedSchema');
  const [modelFields, setModelFields] = React.useState<ModelField[]>([]);
  const [modifiableFields, setModifiableFields] = React.useState<ModelField[]>(
    []
  );
  useEffect(() => {
    // parse DeclaredSchema and provide fields
    if (!selectedSchema) return;
    const parsedSchema = models.find(model => model._id === selectedSchema);
    if (!parsedSchema) return;

    setModelFields(
      Object.keys(parsedSchema.fields).map((fieldName: any) => {
        const isArray = Array.isArray(parsedSchema.fields);
        const field = isArray
          ? parsedSchema.fields[fieldName][0]
          : parsedSchema.fields[fieldName];
        return {
          name: fieldName,
          type: field.type,
          isArray: isArray,
        };
      })
    );
    if (
      parsedSchema?.modelOptions?.conduit?.permissions?.canModify ===
      'Everything'
    ) {
      setModifiableFields(
        Object.keys(parsedSchema.fields).map((fieldName: any) => {
          const isArray = Array.isArray(parsedSchema.fields);
          const field = isArray
            ? parsedSchema.fields[fieldName][0]
            : parsedSchema.fields[fieldName];
          return {
            name: fieldName,
            type: field.type,
            isArray: isArray,
          };
        })
      );
    } else if (
      parsedSchema?.modelOptions?.conduit?.permissions?.canModify ===
      'ExtensionOnly'
    ) {
      let fields = parsedSchema.extensions.filter(
        extension => extension.ownerModule === 'database'
      );
      if (fields.length === 0) {
        setModifiableFields([]);
        return;
      }
      let resultingFields = Object.keys(fields[0]).map((fieldName: any) => {
        const isArray = Array.isArray(fields[0]);
        //@ts-expect-error
        const field = isArray ? fields[0][fieldName][0] : fields[0][fieldName];
        return {
          name: fieldName,
          type: field.type,
          isArray: isArray,
        };
      });
      setModifiableFields(resultingFields);
    } else if (form.watch('operation') !== OperationsEnum.GET) {
      form.setValue('operation', OperationsEnum.GET);
    }
  }, [models, selectedSchema]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'inputs',
  });

  // Add a function to add a condition to a group
  //todo fix
  const addConditionToGroup = (path: string, condition: any) => {
    //@ts-expect-error
    const currentGroup = form.getValues(path);
    const updatedConditions = [...currentGroup, condition];
    //@ts-expect-error
    form.setValue(`${path}`, updatedConditions);
  };

  // Add a function to add a nested group
  //todo fix
  const addNestedGroup = (path: string, groupType: 'AND' | 'OR') => {
    //@ts-expect-error
    const currentGroup = form.getValues(path);
    const newGroup = {
      [groupType]: [],
    };
    const updatedConditions = [...currentGroup, newGroup];
    //@ts-expect-error
    form.setValue(`${path}`, updatedConditions);
  };

  // Add a function to remove a condition or group from a parent group
  //todo fix
  const removeFromGroup = (path: string, index: number) => {
    const currentGroup = form.getValues(path);
    const updatedConditions = [...currentGroup];
    updatedConditions.splice(index, 1);
    //@ts-expect-error
    form.setValue(`${path}`, updatedConditions);
  };

  const {
    fields: setConditions,
    append: appendSetCondition,
    remove: removeSetCondition,
  } = useFieldArray({
    control: form.control,
    name: 'assignments',
  });

  const operation = form.watch('operation');
  const inputs = form.watch('inputs');

  // Check if the operation supports set conditions
  const supportsSetConditions = [
    OperationsEnum.POST,
    OperationsEnum.PUT,
    OperationsEnum.PATCH,
  ].includes(operation);

  // Mock function to fetch models
  const fetchModels = React.useCallback(async () => {
    const { schemas } = await getSchemas({
      skip: 0,
      limit: 1000,
    });
    setModels(
      schemas.filter(model => {
        return model.modelOptions.conduit.permissions.canModify !== 'Nothing';
      })
    );
  }, []);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Filter models based on search term
  const filteredModels = React.useMemo(() => {
    return models.filter(
      model => model.name.toLowerCase().includes(modelSearchTerm.toLowerCase())
      // || model.description.toLowerCase().includes(modelSearchTerm.toLowerCase()),
    );
  }, [models, modelSearchTerm]);

  // Handle form submission
  const onSubmit = (data: QueryFormValues) => {
    // If in JSON mode for inputs, parse the JSON and update the inputs
    if (inputMode === 'json') {
      try {
        data.inputs = JSON.parse(data.inputsJson ?? '[]');
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your input JSON syntax',
          variant: 'destructive',
        });
        return;
      }
    }

    // If in JSON mode for query, parse the JSON and update the conditions
    if (queryMode === 'json') {
      try {
        const parsedQuery = JSON.parse(data.queryJson ?? '{}');
        data.query = parsedQuery.query ?? { AND: [] };
        data.assignments = parsedQuery.assignments ?? [];
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your query JSON syntax',
          variant: 'destructive',
        });
        return;
      }
    }

    if (onSave) {
      onSave(data);
    } else {
      toast({
        title: 'Query saved',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });
    }
  };

  // Sync form inputs with JSON when switching modes
  const handleInputModeChange = (mode: 'form' | 'json') => {
    if (mode === 'json' && inputMode === 'form') {
      // Convert form inputs to JSON
      const inputs = form.getValues('inputs');
      form.setValue('inputsJson', JSON.stringify(inputs, null, 2));
    } else if (mode === 'form' && inputMode === 'json') {
      // Parse JSON and update form inputs
      try {
        const inputsJson = form.getValues('inputsJson');
        const parsedInputs = JSON.parse(inputsJson ?? '[]');
        form.setValue('inputs', parsedInputs);
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Could not parse JSON. Keeping form values.',
          variant: 'destructive',
        });
      }
    }

    setInputMode(mode);
  };

  // Sync query conditions with JSON when switching modes
  const handleQueryModeChange = (mode: 'form' | 'json') => {
    if (mode === 'json' && queryMode === 'form') {
      // Convert form conditions to JSON
      const findConditions = form.getValues('query');
      const setConditions = form.getValues('assignments');
      form.setValue(
        'queryJson',
        JSON.stringify(
          {
            query: findConditions,
            assignments: setConditions,
          },
          null,
          2
        )
      );
    } else if (mode === 'form' && queryMode === 'json') {
      // Parse JSON and update form conditions
      try {
        const queryJson = form.getValues('queryJson');
        const parsedQuery = JSON.parse(queryJson ?? '{}');

        // Ensure the parsed find conditions have the correct structure
        const findConditions = parsedQuery.query || { AND: [] };
        const firstKey = Object.keys(findConditions)[0];
        if (!Array.isArray(findConditions[firstKey])) {
          findConditions[firstKey] = [];
        }
        form.setValue('query', findConditions);
        form.setValue('assignments', parsedQuery.assignments || []);
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Could not parse JSON. Keeping form values.',
          variant: 'destructive',
        });
      }
    }

    setQueryMode(mode);
  };

  // Check if placement is valid for the current operation
  const isPlacementValid = (location: number) => {
    if (location === LocationEnum.BODY) {
      return ![OperationsEnum.GET, OperationsEnum.DELETE].includes(operation);
    }
    return true;
  };

  // Add a helper function to count total conditions in a group (including nested ones)
  const countConditions = (group: any) => {
    if (!group || !group[Object.keys(group)[0]]) return 0;
    return group[Object.keys(group)[0]].reduce(
      (count: number, condition: any) => {
        // If it's a group, recursively count its conditions
        if (
          condition[Object.keys(condition)[0]] === 'AND' ||
          condition[Object.keys(condition)[0]] === 'OR'
        ) {
          return count + countConditions(condition);
        }
        // Otherwise it's a single condition
        return count + 1;
      },
      0
    );
  };

  // Function to get a readable description of a condition
  const getConditionDescription = (condition: Comparison): string => {
    const { schemaField, operation, comparisonField } = condition;

    if (!schemaField) return '';

    let valueDisplay = '';
    if (comparisonField.type === ValueSourceTypeEnum.INPUT) {
      valueDisplay = `input:${comparisonField.value || 'not selected'}`;
    } else if (comparisonField.type === ValueSourceTypeEnum.CUSTOM) {
      valueDisplay = comparisonField.value || 'empty';
    } else if (comparisonField.type === ValueSourceTypeEnum.CONTEXT) {
      valueDisplay = `context:${comparisonField.value || 'not specified'}`;
    }

    return `${schemaField} ${getReadableOperation(operation)} ${valueDisplay}`;
  };

  // Function to get a readable description of a set condition
  const getSetDescription = (condition: Assignment, index: number): string => {
    const { schemaField, action, assignmentField } = condition;
    if (!schemaField) return `Set #${index + 1}`;
    if (!assignmentField.value) return `Set #${index + 1}`;
    let valueDisplay = '';
    if (assignmentField.type === ValueSourceTypeEnum.INPUT) {
      valueDisplay = `input:${assignmentField.value || 'not selected'}`;
    } else if (assignmentField.type === ValueSourceTypeEnum.CUSTOM) {
      valueDisplay = assignmentField.value || 'empty';
    } else if (assignmentField.type === ValueSourceTypeEnum.CONTEXT) {
      valueDisplay = `context:${assignmentField.value || 'not specified'}`;
    }

    switch (action) {
      case AssignmentActionEnum.ASSIGN:
        return `${schemaField} = ${valueDisplay}`;
      case AssignmentActionEnum.INC:
        return `${schemaField}+=${valueDisplay}`;
      case AssignmentActionEnum.DEC:
        return `${schemaField}-=${valueDisplay}`;
      case AssignmentActionEnum.PUSH:
        return `${schemaField}=${schemaField}.concat(${valueDisplay})`;
      case AssignmentActionEnum.PULL:
        return `${schemaField}=${schemaField}.remove(${valueDisplay})`;
      default:
        return `${schemaField} = ${valueDisplay}`;
    }
  };

  // Replace the renderFindCondition function with a recursive function to render condition groups
  // First, add a new function to render a single condition
  const renderCondition = (
    condition: Comparison,
    path: string,
    index: number,
    parentPath: string
  ) => {
    // Get a readable description of the condition
    const conditionDescription = getConditionDescription(condition);
    const conditionTitle = conditionDescription || `Condition #${index + 1}`;

    return (
      <Collapsible
        key={`${path}-${index}`}
        className="border rounded-md overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between p-3 bg-muted/30">
          <div className="flex items-center space-x-2 flex-grow">
            <CollapsibleTrigger className="flex items-center space-x-2 flex-grow text-left">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
              <span className="font-medium truncate">{conditionTitle}</span>
            </CollapsibleTrigger>

            {form.watch(`${path}.schemaField`) && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {form.watch(`${path}.operation`)}
                </Badge>
                <Badge variant="secondary">
                  {form.watch(`${path}.comparisonField.type`)}
                </Badge>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeFromGroup(parentPath, index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <SelectField
                label={'Field'}
                placeholder={'Select field'}
                fieldName={`${path}.schemaField`}
                options={modelFields.map(modelField => ({
                  value: modelField.name,
                  label: (
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(modelField.type)}
                      <span>{modelField.name}</span>
                      {modelField.isArray && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          Array
                        </Badge>
                      )}
                    </div>
                  ),
                }))}
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label={'Comparison'}
                placeholder={'Select comparison'}
                fieldName={`${path}.operation`}
                options={comparisonOperations.map(op => ({
                  value: op.value,
                  label: op.label,
                }))}
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label={'Value Source'}
                placeholder={'Select value source'}
                fieldName={`${path}.comparisonField.type`}
                options={valueSourceTypes.map(vs => ({
                  value: vs.value,
                  label: vs.label,
                }))}
              />
            </div>

            {form.watch(`${path}.comparisonField.type`) ===
              ValueSourceTypeEnum.INPUT && (
              <div className="space-y-2">
                <SelectField
                  label={'Input'}
                  placeholder={'Select input'}
                  options={inputs.map(input => ({
                    value: input.name,
                    label: input.name,
                  }))}
                  fieldName={`${path}.comparisonField.value`}
                />
              </div>
            )}

            {form.watch(`${path}.comparisonField.type`) ===
              ValueSourceTypeEnum.CUSTOM && (
              <div className="space-y-2">
                <InputField
                  label={'Custom Value'}
                  fieldName={`${path}.comparisonField.value`}
                  placeholder={'Enter custom value'}
                />
              </div>
            )}

            {form.watch(`${path}.comparisonField.type`) ===
              ValueSourceTypeEnum.CONTEXT && (
              <div className="space-y-2">
                <InputField
                  label={'Context Value'}
                  fieldName={`${path}.comparisonField.value`}
                  placeholder={'e.g. user.id, currentDate'}
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Update the group rendering to include visual indicators for AND/OR
  const renderConditionGroup = (
    group: any,
    path = 'query',
    isNested = false
  ) => {
    //@ts-expect-error
    const obj = form.watch(`${path}`);
    //@ts-expect-error
    const groupType = obj['AND'] ? 'AND' : 'OR';
    //@ts-expect-error
    const conditions = form.watch(`${path}.${groupType}`) || [];
    return (
      <div
        className={`border rounded-md p-4 mb-4 ${groupType === 'AND' ? 'border-blue-200' : 'border-amber-200'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {groupType === 'AND' ? (
              <LogicalAnd className="h-5 w-5 text-blue-500" />
            ) : (
              <LogicalOr className="h-5 w-5 text-amber-500" />
            )}
            <SelectField
              label={''}
              //@ts-expect-error
              value={form.watch(path)['AND'] ? 'AND' : 'OR'}
              onValueChange={val => {
                const current = form.watch(path as keyof QueryFormValues);
                if (current['AND']) {
                  form.setValue(path as keyof QueryFormValues, {
                    [val]: current['AND'],
                  });
                } else {
                  form.setValue(path as keyof QueryFormValues, {
                    [val]: current['OR'],
                  });
                }
              }}
              options={[
                { value: 'AND', label: 'AND' },
                { value: 'OR', label: 'OR' },
              ]}
            />

            {isNested && (
              <Badge
                variant={groupType === 'AND' ? 'default' : 'outline'}
                className={
                  groupType === 'OR'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : ''
                }
              >
                {countConditions(group)} condition
                {countConditions(group) !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addConditionToGroup(`${path}.${groupType}`, {
                  schemaField: '',
                  operation: ComparisonOperationEnum.EQUAL,
                  comparisonField: {
                    type: ValueSourceTypeEnum.INPUT,
                    value: '',
                  },
                } as Comparison)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addNestedGroup(
                  path === 'query' ? `${path}.${groupType}` : path,
                  groupType === 'AND' ? 'OR' : 'AND'
                )
              }
              className={
                groupType === 'AND' ? 'text-amber-600' : 'text-blue-600'
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {groupType === 'AND' ? 'OR' : 'AND'} Group
            </Button>

            {isNested && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  // Extract parent path and index from the current path
                  const pathParts = path.split('.');
                  const index = Number.parseInt(pathParts.pop() ?? '0');
                  const parentPath = pathParts.join('.');
                  removeFromGroup(parentPath, index);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div
          className={`pl-4 border-l-2 ${groupType === 'AND' ? 'border-blue-200' : 'border-amber-200'}`}
        >
          {conditions.length === 0 ? (
            <div className="flex items-center justify-center p-6 bg-muted/20 rounded-md">
              <div className="text-center text-muted-foreground">
                <p>No conditions in this {groupType} group</p>
                <p className="text-sm">Add conditions or nested groups</p>
              </div>
            </div>
          ) : (
            conditions.map((condition: any, index: number) => {
              // Check if this is a condition or a group
              if (condition['AND'] || condition['OR']) {
                // It's a group, render recursively
                return renderConditionGroup(
                  condition,
                  `${path}.${groupType}.${index}`,
                  true
                );
              } else {
                // It's a condition
                return renderCondition(
                  condition,
                  `${path}.${groupType}.${index}`,
                  index,
                  `${path}.${groupType}`
                );
              }
            })
          )}
        </div>
      </div>
    );
  };

  // Render a set condition
  const renderSetCondition = (condition: any, index: number) => {
    return (
      <Collapsible
        key={condition.id}
        className="border rounded-md overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between p-3 bg-muted/30">
          <div className="flex items-center space-x-2 flex-grow">
            <CollapsibleTrigger className="flex items-center space-x-2 flex-grow text-left">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
              <span className="font-medium truncate">
                {getSetDescription(condition, index)}
              </span>
            </CollapsibleTrigger>

            {form.watch(`assignments.${index}.schemaField`) && (
              <Badge variant="secondary">
                {form.watch(`assignments.${index}.assignmentField.type`)}
              </Badge>
            )}
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeSetCondition(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <SelectField
                label={'Field'}
                fieldName={`assignments.${index}.schemaField`}
                options={modifiableFields.map(modelField => ({
                  value: modelField.name,
                  label: (
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(modelField.type as ValueTypeEnum)}
                      <span>{modelField.name}</span>
                      {modelField.isArray && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          Array
                        </Badge>
                      )}
                    </div>
                  ),
                }))}
              />
            </div>
            <div className="space-y-2">
              <SelectField
                label={'Assignment Action'}
                fieldName={`assignments.${index}.action`}
                options={assignmentOperations.map(vs => ({
                  label: vs.label,
                  value: vs.value,
                }))}
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label={'Value Source'}
                fieldName={`assignments.${index}.assignmentField.type`}
                options={valueSourceTypes.map(vs => ({
                  label: vs.label,
                  value: vs.value,
                }))}
              />
            </div>

            {form.watch(`assignments.${index}.assignmentField.type`) ===
              ValueSourceTypeEnum.INPUT && (
              <div className="space-y-2">
                <SelectField
                  label={'Value from Input'}
                  fieldName={`assignments.${index}.assignmentField.value`}
                  options={form.watch(`inputs`).map(input => ({
                    value: input.name,
                    label: input.name,
                  }))}
                />
              </div>
            )}

            {form.watch(`assignments.${index}.assignmentField.type`) ===
              ValueSourceTypeEnum.CUSTOM && (
              <div className="space-y-2">
                <InputField
                  label={'Custom Value'}
                  fieldName={`assignments.${index}.assignmentField.value`}
                  placeholder={'Enter custom value'}
                />
              </div>
            )}

            {form.watch(`assignments.${index}.assignmentField.type`) ===
              ValueSourceTypeEnum.CONTEXT && (
              <div className="space-y-2">
                <InputField
                  label={'Context Value'}
                  fieldName={`assignments.${index}.assignmentField.value`}
                  placeholder={'e.g. user.id, currentDate'}
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onBack && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-2xl font-bold">
              {initialData ? 'Edit Query' : 'Create New Query'}
            </h2>
          </div>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Query
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Query Information</CardTitle>
              <CardDescription>
                Define the basic properties of your query
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <InputField
                  label={'Query Name'}
                  fieldName={'name'}
                  placeholder="Enter query name"
                />
                {/*{form.formState.errors.name && (*/}
                {/*  <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>*/}
                {/*)}*/}
              </div>

              <div className="space-y-2">
                <TextAreaField
                  label={'Description'}
                  fieldName={'description'}
                  placeholder="Describe what this query does"
                  rows={3}
                />
              </div>

              {/* Now add the checkbox in the Query Information card, after the description field */}
              {/* In the CardContent of the first Card (Query Information) */}
              {/* Add this after the description textarea: */}
              <div className="flex items-center space-x-2">
                <InputField
                  type={'checkbox'}
                  label={'Requires Authentication'}
                  fieldName={'authenticated'}
                  classNames={{
                    description: 'text-xs text-muted-foreground',
                    input:
                      'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
                    // formItem: 'flex flex-row',
                  }}
                  description={
                    ' When enabled, this query will only be accessible to authenticated users'
                  }
                />
              </div>

              <div className="space-y-2">
                <SelectField
                  label={'Operation'}
                  placeholder="Select operation"
                  classNames={{
                    selectTrigger:
                      '[&>span>div]:flex-row [&>span>div]:items-center [&>span>div]:justify-start [&>span>div]:gap-2',
                  }}
                  options={operationTypes.map(op => ({
                    value: op.value,
                    label: (
                      <div className="flex flex-col">
                        <span>{op.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {op.description}
                        </span>
                      </div>
                    ),
                  }))}
                  fieldName={'operation'}
                />
                {/*{form.formState.errors.operation && (*/}
                {/*  <p className='text-sm text-destructive'>{form.formState.errors.operation.message}</p>*/}
                {/*)}*/}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Dialog
                  open={isModelDialogOpen}
                  onOpenChange={setIsModelDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {form.watch('selectedSchemaName') || 'Select a model'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select Model</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search models..."
                          value={modelSearchTerm}
                          onChange={e => setModelSearchTerm(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {filteredModels.map(model => (
                            <Button
                              key={model._id}
                              variant="ghost"
                              className="w-full justify-start text-left"
                              onClick={() => {
                                form.setValue('selectedSchema', model._id, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                });
                                form.setValue(
                                  'selectedSchemaName',
                                  model.name,
                                  {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                  }
                                );
                                setIsModelDialogOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span>{model.name}</span>
                                {/*<span className='text-xs text-muted-foreground truncate'>{model.description}</span>*/}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
                {form.formState.errors.selectedSchema && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.selectedSchema.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inputs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Query Inputs</CardTitle>
              <CardDescription>
                Define the inputs for your query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={inputMode}
                onValueChange={value =>
                  handleInputModeChange(value as 'form' | 'json')
                }
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="form">
                    <FormInput className="w-4 h-4 mr-2" />
                    Form
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="space-y-4">
                  {fields.map((field, index) => (
                    <Collapsible
                      key={field.id}
                      className="border rounded-md overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center space-x-2 w-full justify-between mr-2">
                          <CollapsibleTrigger className="flex items-center space-x-2  text-left">
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                            <span className="font-medium truncate">
                              {form.watch(`inputs.${index}.name`) ||
                                `Input #${index + 1}`}
                            </span>
                          </CollapsibleTrigger>

                          {form.watch(`inputs.${index}.name`) && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {getTypeIcon(
                                  ValueTypeEnum[
                                    form.watch(
                                      `inputs.${index}.type`
                                    ) as keyof typeof ValueTypeEnum
                                  ]
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {form.watch(`inputs.${index}.type`)}
                                  {form.watch(`inputs.${index}.array`) && '[]'}
                                </Badge>
                              </div>

                              <div className="flex items-center space-x-1">
                                {getPlacementIcon(
                                  form.watch(`inputs.${index}.location`)
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {getPlacementName(
                                    form.watch(`inputs.${index}.location`)
                                  )}
                                </Badge>
                              </div>

                              {form.watch(`inputs.${index}.optional`) && (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs"
                                >
                                  Optional
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <CollapsibleContent>
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <InputField
                              label={'Name'}
                              fieldName={`inputs.${index}.name`}
                              placeholder={'e.g. id, name, filter'}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <SelectField
                                label={'Type'}
                                fieldName={`inputs.${index}.type`}
                                placeholder="Select type"
                                options={inputTypes.map(type => ({
                                  value: type.value,
                                  label: (
                                    <div className="flex items-center space-x-2">
                                      {getTypeIcon(type.value)}
                                      <span>{type.label}</span>
                                    </div>
                                  ),
                                }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <SelectField
                                label={'Placement'}
                                fieldName={`inputs.${index}.location`}
                                placeholder="Select placement"
                                // onValueChange={(value) => {
                                //   field.onChange(value);
                                //   // If changing to path, disable array and make required
                                //   if (value === 'path') {
                                //     form.setValue(`inputs.${index}.isArray`, false);
                                //     form.setValue(`inputs.${index}.required`, true);
                                //   }
                                // }}
                                // disabled={field.value === 'body' && !isPlacementValid('body')}
                                options={placementTypes.map(place => ({
                                  value: place.value,
                                  label: (
                                    <div className="flex items-center space-x-2">
                                      {getPlacementIcon(place.value)}
                                      <div className="flex flex-col">
                                        <span>{place.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {place.description}
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                }))}
                              />
                              {form.watch(`inputs.${index}.location`) ===
                                LocationEnum.BODY &&
                                [
                                  OperationsEnum.GET,
                                  OperationsEnum.DELETE,
                                ].includes(operation) && (
                                  <p className="text-xs text-destructive">
                                    Body parameters are not allowed for{' '}
                                    Find/Delete operations
                                  </p>
                                )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <InputField
                                type="checkbox"
                                id={`inputs.${index}.optional`}
                                label={'Optional'}
                                fieldName={`inputs.${index}.optional`}
                                disabled={
                                  form.watch(`inputs.${index}.location`) ===
                                  LocationEnum.URL
                                }
                                classNames={{
                                  formItem:
                                    'flex flex-row items-center space-x-2',
                                  input:
                                    'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
                                  label:
                                    form.watch(`inputs.${index}.location`) ===
                                    LocationEnum.URL
                                      ? 'text-muted-foreground'
                                      : '',
                                }}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <InputField
                                type="checkbox"
                                id={`inputs.${index}.array`}
                                disabled={
                                  form.watch(`inputs.${index}.location`) ===
                                  LocationEnum.URL
                                }
                                classNames={{
                                  formItem:
                                    'flex flex-row items-center space-x-2',
                                  input:
                                    'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
                                  label:
                                    form.watch(`inputs.${index}.location`) ===
                                    LocationEnum.URL
                                      ? 'text-muted-foreground'
                                      : '',
                                }}
                                fieldName={`inputs.${index}.array`}
                                label={'Is Array'}
                              />
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        name: '',
                        type: ValueTypeEnum.STRING,
                        location: LocationEnum.QUERY,
                        optional: false,
                        array: false,
                      })
                    }
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Input
                  </Button>
                </TabsContent>

                <TabsContent value="json">
                  <div className="space-y-2">
                    <TextAreaField
                      label={'Inputs JSON'}
                      fieldName={'inputsJson'}
                      rows={15}
                      placeholder={`[
                      {
                        "name": "id",
                        "type": "string",
                        "location": 0,
                        "optional": false,
                        "array": false
                      }
                    ]`}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Define complex input types using JSON format
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {fields.length} input{fields.length !== 1 ? 's' : ''} defined
              </div>
              {inputMode === 'json' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    try {
                      const inputsJson = form.getValues('inputsJson');
                      //todo add more complex validation
                      JSON.parse(inputsJson ?? '[]');
                      toast({
                        title: 'Valid JSON',
                        description: 'Your JSON syntax is valid',
                      });
                    } catch (error) {
                      toast({
                        title: 'Invalid JSON',
                        description: 'Please check your JSON syntax',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <Code className="mr-2 h-4 w-4" />
                  Validate JSON
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Query Definition Section */}
        <Card>
          <CardHeader>
            <CardTitle>Query Definition</CardTitle>
            <CardDescription>Define how your query will work</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={queryMode}
              onValueChange={value =>
                handleQueryModeChange(value as 'form' | 'json')
              }
            >
              <TabsList className="mb-4">
                <TabsTrigger value="form">
                  <Filter className="w-4 h-4 mr-2" />
                  Form
                </TabsTrigger>
                <TabsTrigger value="json">
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="space-y-6">
                {/* Find Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Find Conditions
                    </h3>
                  </div>

                  {/* Replace the existing condition rendering with the new group renderer */}
                  {renderConditionGroup('query')}
                </div>

                {/* Set Conditions (only for create, update, patch) */}
                {supportsSetConditions && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Set Values
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendSetCondition({
                              schemaField: '',
                              action: AssignmentActionEnum.ASSIGN,
                              assignmentField: {
                                type: ValueSourceTypeEnum.INPUT,
                                value: '',
                              },
                            })
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Set Value
                        </Button>
                      </div>

                      {setConditions.length === 0 ? (
                        <div className="flex items-center justify-center p-6 border rounded-md bg-muted/20">
                          <div className="text-center text-muted-foreground">
                            <Settings className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>No set values defined</p>
                            <p className="text-sm">
                              Add values to set in your {operation} operation
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {setConditions.map((condition, index) =>
                            renderSetCondition(condition, index)
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="json">
                <div className="space-y-2">
                  <TextAreaField
                    label={'Query JSON'}
                    fieldName={'queryJson'}
                    rows={15}
                    className="font-mono"
                    placeholder={`{
  "query": {
    "AND": [
      {
        "field": "name",
        "operation": "eq",
        "valueSource": "input",
        "inputName": "name"
      },
      {
        ""OR": [
          {
            "field": "age",
            "operation": "gt",
            "valueSource": "custom",
            "customValue": "18"
          },
          {
            "field": "isVerified",
            "operation": "eq",
            "valueSource": "custom",
            "customValue": "true"
          }
        ]
      }
    ]
  },
  "assignment": [
    {
      "schemaField": "status",
       "action": 0,
      "assignmentField": {
        "type":0,
        "value": ""
       },
    }
  ]
}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define your query conditions using JSON format
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            {/* Update the footer text to use the countConditions function */}
            <div className="text-sm text-muted-foreground">
              {countConditions(form.watch('query'))} find condition
              {countConditions(form.watch('query')) !== 1 ? 's' : ''} and
              {supportsSetConditions
                ? ` ${setConditions.length} set value${setConditions.length !== 1 ? 's' : ''}`
                : ' no set values'}{' '}
              defined
            </div>
            {queryMode === 'json' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  try {
                    const queryJson = form.getValues('queryJson');
                    //todo more complex parsing
                    JSON.parse(queryJson ?? '{}');
                    toast({
                      title: 'Valid JSON',
                      description: 'Your JSON syntax is valid',
                    });
                  } catch (error) {
                    toast({
                      title: 'Invalid JSON',
                      description: 'Please check your JSON syntax',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <Code className="mr-2 h-4 w-4" />
                Validate JSON
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
