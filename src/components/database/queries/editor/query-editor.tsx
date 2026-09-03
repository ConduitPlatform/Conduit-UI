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
  BinaryIcon as LogicalOr,
  Check,
  ChevronDown,
  Code,
  Copy,
  FileJson,
  Filter,
  FormInput,
  Loader2,
  Plus,
  PlusIcon as LogicalAnd,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import { rhfZodResolver } from '@/lib/zod-form';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/lib/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
  valueSourceTypes,
} from './constants';
import {
  getReadableOperation,
  getTypeIcon,
} from '@/components/database/queries/editor/utils';
import { QueryInputItem } from '@/components/database/queries/editor/query-input-item';
import { QueryInformation } from '@/components/database/queries/editor/query-information';
import { useQueryWorkspaceOptional } from '@/components/database/queries/query-workspace-context';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';
import {
  getEndpointPath,
  getOperationMeta,
} from '@/components/database/queries/query-operations';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

const INPUTS_JSON_PLACEHOLDER = `[
  {
    "name": "id",
    "type": "String",
    "location": 1,
    "optional": false,
    "array": false
  }
]`;

const QUERY_JSON_PLACEHOLDER = `{
  "query": {
    "AND": [
      {
        "schemaField": "name",
        "operation": 0,
        "comparisonField": {
          "type": "Input",
          "value": "name"
        }
      }
    ]
  },
  "assignments": [
    {
      "schemaField": "status",
      "action": 0,
      "assignmentField": {
        "type": "Custom",
        "value": "active"
      }
    }
  ]
}`;

interface QueryEditorProps {
  onSave?: (data: QueryFormValues) => Promise<{ id: string } | void>;
  initialData?: Partial<CustomEndpoint>;
}

export function QueryEditor({
  onSave,
  initialData,
}: Readonly<QueryEditorProps>) {
  const workspace = useQueryWorkspaceOptional();
  const router = useRouter();
  const [models, setModels] = React.useState<DeclaredSchema[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(true);
  const [modelSearchTerm, setModelSearchTerm] = React.useState('');
  const [inputMode, setInputMode] = React.useState<'form' | 'json'>('form');
  const [queryMode, setQueryMode] = React.useState<'form' | 'json'>('form');
  const [saveShortcutLabel, setSaveShortcutLabel] = React.useState('Ctrl+S');
  const [copiedPath, setCopiedPath] = React.useState(false);

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
  const queryName = form.watch('name');

  const setWorkspaceDirty = workspace?.setDirty;
  React.useEffect(() => {
    setWorkspaceDirty?.(isDirty);
    return () => setWorkspaceDirty?.(false);
  }, [isDirty, setWorkspaceDirty]);

  React.useEffect(() => {
    const platform = navigator.platform || navigator.userAgent;
    setSaveShortcutLabel(
      /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘S' : 'Ctrl+S'
    );
  }, []);

  const setDirtyValue = (
    path: string,
    value: unknown,
    options?: { shouldValidate?: boolean }
  ) => {
    form.setValue(path as QueryFormPath, value as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: options?.shouldValidate ?? true,
    });
  };

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
    setDirtyValue(path, updatedConditions);
  };

  const addNestedGroup = (path: string, groupType: 'AND' | 'OR') => {
    const currentGroup = form.getValues(path as any) as unknown[];
    const newGroup = {
      [groupType]: [],
    };
    const updatedConditions = [...currentGroup, newGroup];
    setDirtyValue(path, updatedConditions);
  };

  const removeFromGroup = (path: string, index: number) => {
    const currentGroup = form.getValues(path as any) as unknown[];
    const updatedConditions = [...currentGroup];
    updatedConditions.splice(index, 1);
    setDirtyValue(path, updatedConditions);
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
        form.setValue('operation', OperationsEnum.GET, { shouldDirty: true });
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
        form.setValue('operation', OperationsEnum.GET, { shouldDirty: true });
      }
    } else if (operation === OperationsEnum.DELETE) {
      if (!selectedModel.modelOptions?.conduit?.permissions?.canDelete) {
        toast({
          title: 'Error',
          description:
            'This model does not support deleting entries through custom queries',
          variant: 'destructive',
        });
        form.setValue('operation', OperationsEnum.GET, { shouldDirty: true });
      }
    }
  }, [operation]);

  const supportsSetConditions = [
    OperationsEnum.POST,
    OperationsEnum.PUT,
    OperationsEnum.PATCH,
  ].includes(operation);

  const fetchModels = React.useCallback(async () => {
    setModelsLoading(true);
    try {
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
    } catch (error) {
      console.error(error);
      toast({
        title: 'Could not load models',
        description: 'Select a model after retrying from the list filters.',
        variant: 'destructive',
      });
    } finally {
      setModelsLoading(false);
    }
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
        conditionGroupSchema.parse(data.query);
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
        .then(async result => {
          const createdId = result?.id;
          toast({
            title: initialData?._id ? 'Query updated' : 'Query created',
            description: createdId
              ? `${data.name} is available at ${getEndpointPath(data.name)}.`
              : `${data.name} has been saved.`,
          });
          await workspace?.refreshQueries();
          if (createdId && !initialData?._id) {
            workspace?.setDirty(false);
            router.push(`/database/queries/${createdId}`);
            return;
          }
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
          <pre className="mt-2 w-[340px] rounded-md bg-muted p-4">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      if (!isSubmitting && isDirty) {
        const formEl = document.getElementById(
          'query-editor-form'
        ) as HTMLFormElement | null;
        formEl?.requestSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isSubmitting]);

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
        form.setValue('inputs', parsedInputs, {
          shouldDirty: true,
          shouldTouch: true,
        });
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
        form.setValue('query', findConditions, {
          shouldDirty: true,
          shouldTouch: true,
        });
        form.setValue('assignments', parsedQuery.assignments || [], {
          shouldDirty: true,
          shouldTouch: true,
        });
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

  const countConditions = (group: unknown): number => {
    if (!group || typeof group !== 'object') return 0;
    const nested = group as { AND?: unknown[]; OR?: unknown[] };
    const items = nested.AND ?? nested.OR;
    if (!Array.isArray(items)) return 0;
    return items.reduce((count: number, condition: unknown) => {
      if (
        condition &&
        typeof condition === 'object' &&
        ('AND' in condition || 'OR' in condition)
      ) {
        return count + countConditions(condition);
      }
      return count + 1;
    }, 0);
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

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove condition"
                  onClick={() => removeFromGroup(parentPath, index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Remove this condition from the draft. Save to persist.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                          form.setValue(qp('comparisonField.like'), false, {
                            shouldDirty: true,
                          });
                          form.setValue(
                            qp('comparisonField.caseSensitiveLike'),
                            false,
                            { shouldDirty: true }
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
                description="Where the compared value comes from at request time."
                options={valueSourceTypes.map(vs => ({
                  value: vs.value,
                  label: (
                    <div className="flex flex-col">
                      <span>{vs.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {vs.description}
                      </span>
                    </div>
                  ),
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
                  placeholder={'e.g. user._id'}
                  info="Request context path, such as user._id. Resolved when the endpoint runs."
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
                    <FormItem className="flex flex-row items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={Boolean(field.value)}
                          onCheckedChange={checked => {
                            const isChecked = Boolean(checked);
                            field.onChange(isChecked);
                            if (!isChecked) {
                              form.setValue(
                                qp('comparisonField.caseSensitiveLike'),
                                false,
                                { shouldDirty: true }
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <div className="flex flex-col gap-1 leading-none">
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
                  <Controller
                    name={qp('comparisonField.caseSensitiveLike')}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={Boolean(field.value)}
                            onCheckedChange={checked =>
                              field.onChange(Boolean(checked))
                            }
                          />
                        </FormControl>
                        <div className="flex flex-col gap-1 leading-none">
                          <FormLabel className="font-normal">
                            Case sensitive
                          </FormLabel>
                          <FormDescription className="text-xs">
                            When off, matching is case-insensitive (e.g. ILIKE
                            on PostgreSQL).
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
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
        className={cn(
          'mb-4 rounded-md border p-4',
          groupType === 'AND' ? 'border-primary/30' : 'border-border'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {groupType === 'AND' ? (
              <LogicalAnd className="h-5 w-5 text-primary" />
            ) : (
              <LogicalOr className="h-5 w-5 text-muted-foreground" />
            )}
            <SelectField
              label={''}
              value={
                (form.watch(path as QueryFormPath) as { AND?: unknown })?.AND
                  ? 'AND'
                  : 'OR'
              }
              onValueChange={val => {
                const current = form.watch(path as keyof QueryFormValues) as {
                  AND?: unknown;
                  OR?: unknown;
                };
                if (current['AND']) {
                  setDirtyValue(path, { [val]: current['AND'] });
                } else {
                  setDirtyValue(path, { [val]: current['OR'] });
                }
              }}
              options={[
                { value: 'AND', label: 'AND' },
                { value: 'OR', label: 'OR' },
              ]}
            />

            {isNested && (
              <Badge variant={groupType === 'AND' ? 'secondary' : 'outline'}>
                {countConditions(groupRoot)} condition
                {countConditions(groupRoot) !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
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
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {groupType === 'AND' ? 'OR' : 'AND'} Group
            </Button>

            {isNested && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove group"
                      onClick={() => {
                        const pathParts = path.split('.');
                        const index = Number.parseInt(pathParts.pop() ?? '0');
                        const parentPath = pathParts.join('.');
                        removeFromGroup(parentPath, index);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Remove this group from the draft. Save to persist.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div
          className={cn(
            'border-l-2 pl-4',
            groupType === 'AND' ? 'border-primary/30' : 'border-border'
          )}
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

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove set value"
                  onClick={() => removeSetCondition(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Remove this assignment from the draft. Save to persist.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                description="Where the assigned value comes from at request time."
                options={valueSourceTypes.map(vs => ({
                  label: (
                    <div className="flex flex-col">
                      <span>{vs.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {vs.description}
                      </span>
                    </div>
                  ),
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
                  placeholder={'e.g. user._id'}
                  info="Request context path, such as user._id. Resolved when the endpoint runs."
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const operationMeta = getOperationMeta(operation);
  const endpointPath = getEndpointPath(queryName);

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(endpointPath);
      setCopiedPath(true);
      window.setTimeout(() => setCopiedPath(false), 1500);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy the endpoint path.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        id="query-editor-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-full flex-col"
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-background/95 px-6 py-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-balance">
                  {initialData?._id
                    ? queryName || 'Edit query'
                    : 'Create query'}
                </h2>
                {isDirty && (
                  <Badge variant="secondary" className="font-normal">
                    Unsaved changes
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono font-normal">
                  {operationMeta.method}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="truncate font-mono text-xs text-muted-foreground slashed-zero">
                  {endpointPath}
                </code>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Copy endpoint path"
                        onClick={() => void handleCopyPath()}
                      >
                        {copiedPath ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Client API path for this custom endpoint
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {initialData?._id && workspace && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    workspace.requestDelete(
                      initialData._id as string,
                      queryName || initialData.name || 'this query'
                    )
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting
                  ? 'Saving…'
                  : initialData?._id
                    ? 'Save changes'
                    : 'Create query'}
                {!isSubmitting && isDirty && (
                  <kbd className="ml-1 rounded border bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px]">
                    {saveShortcutLabel}
                  </kbd>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {operation === OperationsEnum.DELETE && (
            <Alert variant="destructive">
              <AlertTitle>This endpoint deletes documents</AlertTitle>
              <AlertDescription>
                Runtime calls matching the find conditions will permanently
                remove documents from{' '}
                {form.watch('selectedSchemaName') || 'the selected model'}.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            <QueryInformation
              contractLocked={!!initialData?._id}
              modelsLoading={modelsLoading}
              filteredModels={filteredModels}
              modelSearchTerm={modelSearchTerm}
              onModelSearchChange={setModelSearchTerm}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  Query Inputs
                  <QueryFieldHint content="Inputs become request parameters. Path values are required URL segments; query and body values are optional unless marked required." />
                </CardTitle>
                <CardDescription>
                  Parameters callers pass when invoking this endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={inputMode}
                  onValueChange={value =>
                    handleInputModeChange(value as 'form' | 'json')
                  }
                >
                  <div className="mb-4 flex items-center gap-2">
                    <TabsList>
                      <TabsTrigger value="form">
                        <FormInput className="mr-2 h-4 w-4" />
                        Form
                      </TabsTrigger>
                      <TabsTrigger value="json">
                        <FileJson className="mr-2 h-4 w-4" />
                        JSON
                      </TabsTrigger>
                    </TabsList>
                    <QueryFieldHint content="JSON mode edits the raw input contract. Validate before saving." />
                  </div>

                  <TabsContent value="form" className="space-y-4">
                    {fields.length === 0 && (
                      <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-sm text-muted-foreground">
                        No inputs yet. Add the parameters callers will send.
                      </p>
                    )}
                    {fields.map((field, index) => (
                      <QueryInputItem
                        key={field.id}
                        index={index}
                        operation={operation}
                        onRemove={() => remove(index)}
                      />
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
                        placeholder={INPUTS_JSON_PLACEHOLDER}
                        className="font-mono slashed-zero"
                      />
                      <p className="text-xs text-muted-foreground">
                        Array of inputs. `location` is 0 body, 1 query, 2 path.
                        `type` uses String, Number, Boolean, Date, ObjectId, or
                        JSON.
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
                <CardTitle className="flex items-center gap-1.5">
                  Query Definition
                  <QueryFieldHint content="Find conditions filter documents. Set values write fields on Create, Update, and Patch." />
                </CardTitle>
                <CardDescription>
                  Conditions and assignments executed by this endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={queryMode}
                  onValueChange={value =>
                    handleQueryModeChange(value as 'form' | 'json')
                  }
                >
                  <div className="mb-4 flex items-center gap-2">
                    <TabsList>
                      <TabsTrigger value="form">
                        <Filter className="mr-2 h-4 w-4" />
                        Form
                      </TabsTrigger>
                      <TabsTrigger value="json">
                        <FileJson className="mr-2 h-4 w-4" />
                        JSON
                      </TabsTrigger>
                    </TabsList>
                    <QueryFieldHint content="JSON mode edits find conditions and assignments as a single document. Validate before saving." />
                  </div>

                  <TabsContent value="form" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 text-lg font-medium">
                          <Filter className="h-5 w-5" />
                          Find Conditions
                          <QueryFieldHint content="Documents must match this group. AND requires every condition; OR requires any condition." />
                        </h3>
                      </div>

                      {renderConditionGroup('query')}
                    </div>

                    {supportsSetConditions && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-1.5 text-lg font-medium">
                              <Settings className="h-5 w-5" />
                              Set Values
                              <QueryFieldHint content="Fields written when this Create, Update, or Patch endpoint runs." />
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
                                  Add values to set in your{' '}
                                  {operationMeta.label} operation
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
                        className="font-mono slashed-zero"
                        placeholder={QUERY_JSON_PLACEHOLDER}
                      />
                      <p className="text-xs text-muted-foreground">
                        Object with `query` (AND/OR groups) and `assignments`.
                        Comparison `operation` and assignment `action` are
                        numeric enums.
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
                          conditionGroupSchema.parse(parsed.query);
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
        </div>
      </form>
    </Form>
  );
}
