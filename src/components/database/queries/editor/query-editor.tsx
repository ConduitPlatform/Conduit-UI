'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Controller,
  useFieldArray,
  useForm,
  type FieldPath,
} from 'react-hook-form';
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
import { rhfZodResolver } from '@/lib/zod-form';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

/** Radix Select passes string values; API may return numbers for these enums. */
const numericEnum = (e: Parameters<typeof z.nativeEnum>[0]) =>
  z.preprocess(val => {
    if (val === '' || val === undefined || val === null) return val;
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, z.nativeEnum(e));

const conditionSchema = z.object({
  schemaField: z.string().min(1, 'Field is required'),
  operation: numericEnum(ComparisonOperationEnum),
  comparisonField: z.object({
    type: z.nativeEnum(ValueSourceTypeEnum),
    value: z.string().optional(),
    like: z.boolean().optional(),
    caseSensitiveLike: z.boolean().optional(),
  }),
});

// set to any due to TS issues
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

const setConditionSchema = z.object({
  schemaField: z.string().min(1, 'Field is required'),
  action: numericEnum(AssignmentActionEnum),
  assignmentField: z.object({
    type: z.nativeEnum(ValueSourceTypeEnum),
    value: z.string(),
  }),
});
const inputsSchema = z.array(
  z.object({
    name: z.string().min(1, 'Input name is required'),
    type: z.nativeEnum(ValueTypeEnum),
    location: numericEnum(LocationEnum),
    optional: z.boolean().default(false),
    array: z.boolean().default(false),
  })
);
const querySchema = z.object({
  name: z
    .string()
    .min(1, 'Query name is required')
    .refine(s => !s.includes(' '), 'Query name cannot contain spaces'),
  endpointDescription: z.string().optional(),
  operation: numericEnum(OperationsEnum),
  selectedSchema: z.string().min(1, 'Model is required'),
  selectedSchemaName: z.string(),
  authentication: z.boolean().default(false),
  paginated: z.boolean().default(false),
  sorted: z.boolean().default(false),
  inputs: inputsSchema,
  inputsJson: z.string().optional(),
  query: conditionGroupSchema.default({
    AND: [],
  }),
  assignments: z.array(setConditionSchema),
  queryJson: z.string().optional(),
});

type QueryFormValues = z.infer<typeof querySchema>;
/** Nested condition paths are built at runtime; widen for react-hook-form APIs. */
type QueryFormPath = FieldPath<QueryFormValues>;

interface QueryEditorProps {
  onBack?: () => void;
  onSave?: (data: QueryFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: Partial<CustomEndpoint>;
}

export function QueryEditor({
  onBack,
  onSave,
  onDelete,
  initialData,
}: Readonly<QueryEditorProps>) {
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [isModelDialogOpen, setIsModelDialogOpen] = React.useState(false);
  const [modelSearchTerm, setModelSearchTerm] = React.useState('');
  const [inputMode, setInputMode] = React.useState<'form' | 'json'>('form');
  const [queryMode, setQueryMode] = React.useState<'form' | 'json'>('form');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const form = useForm<QueryFormValues>({
    resolver: rhfZodResolver(querySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      endpointDescription: initialData?.endpointDescription ?? '',
      operation: Number(initialData?.operation ?? 0),
      selectedSchema: initialData?.selectedSchema ?? undefined,
      selectedSchemaName: initialData?.selectedSchemaName ?? undefined,
      authentication: Boolean(initialData?.authentication),
      paginated: initialData?.paginated ?? false,
      sorted: initialData?.sorted ?? false,
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
  const {
    formState: { isDirty, isSubmitting },
    reset,
    getValues,
  } = form;
  const selectedSchema = form.watch('selectedSchema');
  const [modelFields, setModelFields] = React.useState<ModelField[]>([]);
  const [modifiableFields, setModifiableFields] = React.useState<ModelField[]>(
    []
  );
  useEffect(() => {
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

  const addConditionToGroup = (path: string, condition: any) => {
    const currentGroup = form.getValues(path as any) as unknown[];
    const updatedConditions = [...currentGroup, condition];
    form.setValue(path as any, updatedConditions);
  };

  const addNestedGroup = (path: string, groupType: 'AND' | 'OR') => {
    const currentGroup = form.getValues(path as any) as unknown[];
    const newGroup = {
      [groupType]: [],
    };
    const updatedConditions = [...currentGroup, newGroup];
    form.setValue(path as any, updatedConditions);
  };

  const removeFromGroup = (path: string, index: number) => {
    const currentGroup = form.getValues(path as any) as unknown[];
    const updatedConditions = [...currentGroup];
    updatedConditions.splice(index, 1);
    form.setValue(path as any, updatedConditions);
  };

  const {
    fields: setConditions,
    append: appendSetCondition,
    remove: removeSetCondition,
  } = useFieldArray({
    control: form.control,
    name: 'assignments',
  });

  const operation = form.watch('operation') as OperationsEnum;
  const inputs = form.watch('inputs');
  useEffect(() => {
    const model = form.watch('selectedSchema');
    if (!model) return;
    const selectedModel = models.find(modelItem => modelItem._id === model);
    if (!selectedModel) return;
    if (operation === OperationsEnum.POST) {
      if (!selectedModel.modelOptions?.conduit?.permissions?.canCreate) {
        toast({
          title: 'Error',
          description:
            'This model does not support creating new entries through custom queries',
          variant: 'destructive',
        });
        form.setValue('operation', OperationsEnum.GET);
      }
    } else if (
      operation === OperationsEnum.PUT ||
      operation === OperationsEnum.PATCH
    ) {
      if (
        selectedModel.modelOptions?.conduit?.permissions?.canModify ===
        'Nothing'
      ) {
        toast({
          title: 'Error',
          description:
            'This model does not support modifying entries through custom queries',
          variant: 'destructive',
        });
        form.setValue('operation', OperationsEnum.GET);
      }
    } else if (operation === OperationsEnum.DELETE) {
      if (!selectedModel.modelOptions?.conduit?.permissions?.canDelete) {
        toast({
          title: 'Error',
          description:
            'This model does not support deleting entries through custom queries',
          variant: 'destructive',
        });
        form.setValue('operation', OperationsEnum.GET);
      }
    }
  }, [operation]);

  const supportsSetConditions = [
    OperationsEnum.POST,
    OperationsEnum.PUT,
    OperationsEnum.PATCH,
  ].includes(operation);

  const fetchModels = React.useCallback(async () => {
    const { schemas } = await getSchemas({
      skip: 0,
      limit: 1000,
    });
    setModels(
      schemas.filter(model => {
        return (
          model?.modelOptions?.conduit?.permissions?.canModify !== 'Nothing'
        );
      })
    );
  }, []);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const filteredModels = React.useMemo(() => {
    return models.filter(model => {
      //match search term with model name
      let match = model.name
        .toLowerCase()
        .includes(modelSearchTerm.toLowerCase());
      // if the model is not modifiable, and the operation is not GET, do not show it
      if (
        model.modelOptions?.conduit?.permissions?.canModify === 'Nothing' &&
        operation !== OperationsEnum.GET
      ) {
        match = false;
      }
      // if the model allows only ExtensionOnly modification, check if the operation is PUT or PATCH
      else if (
        model.modelOptions?.conduit?.permissions?.canModify ===
          'ExtensionOnly' &&
        (operation === OperationsEnum.PUT || operation === OperationsEnum.PATCH)
      ) {
        // Check if the model has an extension that allows modification
        match = model.extensions.some(
          extension => extension.ownerModule === 'database'
        );
      }
      // if the model does not allow creating new entries, and the operation is POST, do not show it
      else if (
        !model.modelOptions?.conduit?.permissions?.canCreate &&
        operation === OperationsEnum.POST
      ) {
        match = false;
      }
      // if the model does not allow deleting entries, and the operation is DELETE, do not show it
      else if (
        !model.modelOptions?.conduit?.permissions?.canDelete &&
        operation === OperationsEnum.DELETE
      ) {
        match = false;
      }
      return match;
    });
  }, [models, modelSearchTerm, operation]);

  const onSubmit = (data: QueryFormValues) => {
    // If in JSON mode for inputs, parse the JSON and update the inputs
    if (inputMode === 'json') {
      try {
        data.inputs = JSON.parse(data.inputsJson ?? '[]');
        inputsSchema.parse(data.inputs);
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
        querySchema.parse(data.query);
        z.array(setConditionSchema).parse(data.assignments);
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please check your query JSON syntax',
          variant: 'destructive',
        });
        return;
      }
    }
    if (operation !== OperationsEnum.GET) {
      data.paginated = false;
      data.sorted = false;
    }

    if (onSave) {
      onSave(data)
        .then(() => {
          toast({
            title: 'Query saved',
            description: 'It will be available in a couple os seconds',
          });
          reset(getValues());
        })
        .catch(error => {
          toast({
            title: 'Error saving query',
            description: error.message,
            variant: 'destructive',
          });
        });
    } else {
      toast({
        title: 'Query saved',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-code-bg p-4">
            <code className="text-code-text">
              {JSON.stringify(data, null, 2)}
            </code>
          </pre>
        ),
      });
    }
  };

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

    let opPhrase = getReadableOperation(operation);
    if (comparisonField.like && operation === ComparisonOperationEnum.EQUAL) {
      opPhrase = comparisonField.caseSensitiveLike
        ? 'matches (case-sensitive LIKE)'
        : 'matches (LIKE)';
    }

    return `${schemaField} ${opPhrase} ${valueDisplay}`;
  };

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

  const renderCondition = (
    condition: Comparison,
    path: string,
    index: number,
    parentPath: string
  ) => {
    const qp = (suffix: string) => `${path}.${suffix}` as QueryFormPath;

    // Get a readable description of the condition
    const conditionDescription = getConditionDescription(condition);
    const conditionTitle = conditionDescription || `Condition #${index + 1}`;

    return (
      <Collapsible
        key={`${path}-${index}`}
        className="border rounded-md overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between p-3 bg-muted/30">
          <div className="flex items-center space-x-2 grow">
            <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
              <span className="font-medium truncate">{conditionTitle}</span>
            </CollapsibleTrigger>
            {form.watch(qp('schemaField')) && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {comparisonOperations.find(
                    o => o.value === form.watch(qp('operation'))
                  )?.label ?? form.watch(qp('operation'))}
                </Badge>
                <Badge variant="secondary">
                  {form.watch(qp('comparisonField.type'))}
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
                fieldName={qp('schemaField')}
                options={modelFields.map(modelField => ({
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
              <Controller
                name={qp('operation')}
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Comparison</FormLabel>
                    <Select
                      onValueChange={val => {
                        const n = Number(val);
                        field.onChange(n);
                        if (n !== ComparisonOperationEnum.EQUAL) {
                          form.setValue(qp('comparisonField.like'), false);
                          form.setValue(
                            qp('comparisonField.caseSensitiveLike'),
                            false
                          );
                        }
                      }}
                      value={String(
                        field.value ?? ComparisonOperationEnum.EQUAL
                      )}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select comparison" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {comparisonOperations.map(op => (
                          <SelectItem key={op.value} value={String(op.value)}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label={'Value Source'}
                placeholder={'Select value source'}
                fieldName={qp('comparisonField.type')}
                options={valueSourceTypes.map(vs => ({
                  value: vs.value,
                  label: vs.label,
                }))}
              />
            </div>

            {form.watch(qp('comparisonField.type')) ===
              ValueSourceTypeEnum.INPUT && (
              <div className="space-y-2">
                <SelectField
                  label={'Input'}
                  placeholder={'Select input'}
                  options={inputs.map(input => ({
                    value: input.name,
                    label: input.name,
                  }))}
                  fieldName={qp('comparisonField.value')}
                />
              </div>
            )}

            {form.watch(qp('comparisonField.type')) ===
              ValueSourceTypeEnum.CUSTOM && (
              <div className="space-y-2">
                <InputField
                  label={'Custom Value'}
                  fieldName={qp('comparisonField.value')}
                  placeholder={'Enter custom value'}
                />
              </div>
            )}
            {form.watch(qp('comparisonField.type')) ===
              ValueSourceTypeEnum.CONTEXT && (
              <div className="space-y-2">
                <InputField
                  label={'Context Value'}
                  fieldName={qp('comparisonField.value')}
                  placeholder={'e.g. user.id, currentDate'}
                />
              </div>
            )}

            {Number(form.watch(qp('operation'))) ===
              ComparisonOperationEnum.EQUAL && (
              <div className="space-y-4 rounded-md border border-border/60 bg-muted/20 p-3">
                <Controller
                  name={qp('comparisonField.like')}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                          checked={Boolean(field.value)}
                          onChange={e => {
                            const checked = e.target.checked;
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue(
                                qp('comparisonField.caseSensitiveLike'),
                                false
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          Like (pattern match)
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Use % as a wildcard; the value is matched as %input%.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {Boolean(form.watch(qp('comparisonField.like'))) && (
                  <InputField
                    type="checkbox"
                    label="Case sensitive"
                    fieldName={qp('comparisonField.caseSensitiveLike')}
                    description="When off, matching is case-insensitive (e.g. ILIKE on PostgreSQL)."
                    classNames={{
                      formItem: 'flex flex-row items-center space-x-2',
                      input:
                        'h-4 w-4 rounded border-input text-primary focus:ring-primary',
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderConditionGroup = (
    group: any,
    path = 'query',
    isNested = false
  ) => {
    const groupRoot = form.watch(path as QueryFormPath) as {
      AND?: unknown;
      OR?: unknown;
    };
    const groupType = groupRoot?.AND ? 'AND' : 'OR';
    const conditions =
      (form.watch(`${path}.${groupType}` as QueryFormPath) as unknown[]) || [];
    return (
      <div
        className={`mb-4 rounded-md border p-4 ${groupType === 'AND' ? 'border-callout-info' : 'border-callout-warning'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {groupType === 'AND' ? (
              <LogicalAnd className="h-5 w-5 text-callout-info-foreground" />
            ) : (
              <LogicalOr className="h-5 w-5 text-callout-warning-foreground" />
            )}
            <SelectField
              label={''}
              value={
                (form.watch(path as QueryFormPath) as { AND?: unknown })?.AND
                  ? 'AND'
                  : 'OR'
              }
              onValueChange={val => {
                const current = form.watch(path as keyof QueryFormValues);
                // @ts-ignore
                if (current['AND']) {
                  form.setValue(path as keyof QueryFormValues, {
                    // @ts-ignore
                    [val]: current['AND'],
                  });
                } else {
                  form.setValue(path as keyof QueryFormValues, {
                    // @ts-ignore
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
                    ? 'border-callout-warning bg-callout-warning-muted text-callout-warning-foreground'
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
                groupType === 'AND'
                  ? 'text-callout-warning-foreground'
                  : 'text-callout-info-foreground'
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
          className={`border-l-2 pl-4 ${groupType === 'AND' ? 'border-callout-info' : 'border-callout-warning'}`}
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

  const renderSetCondition = (condition: any, index: number) => {
    return (
      <Collapsible
        key={condition.id}
        className="border rounded-md overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between p-3 bg-muted/30">
          <div className="flex items-center space-x-2 grow">
            <CollapsibleTrigger className="flex items-center space-x-2 grow text-left">
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
              {initialData?._id ? 'Edit Query' : 'Create New Query'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete custom query?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the custom endpoint from the platform. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={e => {
                          e.preventDefault();
                          void onDelete().catch((error: Error) => {
                            toast({
                              title: 'Error deleting query',
                              description: error.message,
                              variant: 'destructive',
                            });
                          });
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <Button
              type="submit"
              variant={isDirty ? 'default' : 'outline'}
              disabled={!isDirty || isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Query
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="space-y-2">
                <TextAreaField
                  label={'Description'}
                  fieldName={'endpointDescription'}
                  placeholder="Describe what this query does"
                  rows={3}
                />
              </div>

              <FormField
                control={form.control}
                name="authentication"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                    <div className="space-y-0.5">
                      <FormLabel
                        htmlFor="query-authentication"
                        className="text-base font-medium"
                      >
                        Requires Authentication
                      </FormLabel>
                      <FormDescription>
                        When enabled, this query is only accessible to
                        authenticated users.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        id="query-authentication"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {operation === OperationsEnum.GET && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="paginated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                        <div className="space-y-0.5">
                          <FormLabel
                            htmlFor="query-paginated"
                            className="text-base font-medium"
                          >
                            Paginated
                          </FormLabel>
                          <FormDescription>
                            Expose skip and limit query parameters and return a
                            document count with results.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            id="query-paginated"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sorted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                        <div className="space-y-0.5">
                          <FormLabel
                            htmlFor="query-sorted"
                            className="text-base font-medium"
                          >
                            Sorted
                          </FormLabel>
                          <FormDescription>
                            Allow clients to pass sort query parameters on GET
                            requests.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            id="query-sorted"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="space-y-2">
                <SelectField
                  label={'Operation'}
                  placeholder="Select operation"
                  disabled={!!initialData?._id}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Dialog
                  open={isModelDialogOpen}
                  onOpenChange={setIsModelDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      disabled={!!initialData?._id}
                    >
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
                      <div className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer">
                        <CollapsibleTrigger className="flex items-center space-x-2 grow justify-between text-left cursor-pointer mr-2">
                          <div
                            className={
                              'flex flex-row space-x-2 text-left items-center'
                            }
                          >
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                            <span className="font-medium truncate">
                              {form.watch(`inputs.${index}.name`) ||
                                `Input #${index + 1}`}
                            </span>
                          </div>
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
                                  form.watch(
                                    `inputs.${index}.location`
                                  ) as LocationEnum
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {getPlacementName(
                                    form.watch(
                                      `inputs.${index}.location`
                                    ) as LocationEnum
                                  )}
                                </Badge>
                              </div>

                              {form.watch(`inputs.${index}.optional`) && (
                                <Badge
                                  variant="outline"
                                  className="border-callout-warning bg-callout-warning-muted text-xs text-callout-warning-foreground"
                                >
                                  Optional
                                </Badge>
                              )}
                            </div>
                          )}
                        </CollapsibleTrigger>
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
                                    'h-4 w-4 rounded border-input text-primary focus:ring-primary',
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
                                    'h-4 w-4 rounded border-input text-primary focus:ring-primary',
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
                      const parsed = JSON.parse(inputsJson ?? '[]');
                      inputsSchema.parse(parsed);
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

        {form.watch('selectedSchema') && (
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Find Conditions
                      </h3>
                    </div>

                    {renderConditionGroup('query')}
                  </div>

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
                      const parsed = JSON.parse(queryJson ?? '{}');
                      if (parsed.query) {
                        conditionGroupSchema.parse(parsed);
                      }
                      if (parsed.assignments) {
                        z.array(setConditionSchema).parse(parsed.assignments);
                      }

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
        )}
      </form>
    </Form>
  );
}
