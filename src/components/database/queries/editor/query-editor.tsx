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
import * as React from 'react';
import { useEffect } from 'react';
import {
  Check,
  Code,
  Copy,
  FileJson,
  Filter,
  FormInput,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { rhfZodResolver } from '@/lib/zod-form';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/lib/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Form } from '@/components/ui/form';
import {
  AssignmentActionEnum,
  ComparisonOperationEnum,
  CustomEndpoint,
  LocationEnum,
  OperationsEnum,
  ValueSourceTypeEnum,
  ValueTypeEnum,
} from '@/lib/models/database/custom-endpoints';
import { z } from 'zod';
import { getSchemas } from '@/lib/api/database';
import { DeclaredSchema } from '@/lib/models/database';
import { TextAreaField } from '@/components/ui/form-inputs/TextAreaField';
import { QueryInputItem } from '@/components/database/queries/editor/query-input-item';
import { QueryInformation } from '@/components/database/queries/editor/query-information';
import {
  countConditions,
  QueryAssignments,
  QueryConditionGroup,
} from '@/components/database/queries/editor/query-condition-group';
import { QueryModelField } from '@/components/database/queries/editor/query-compact-fields';
import { useQueryWorkspaceOptional } from '@/components/database/queries/query-workspace-context';
import { QueryFieldHint } from '@/components/database/queries/query-field-hint';
import {
  getEndpointPath,
  getOperationMeta,
} from '@/components/database/queries/query-operations';
import { useRouter } from 'next/navigation';

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

  const [modelFields, setModelFields] = React.useState<QueryModelField[]>([]);
  const [modifiableFields, setModifiableFields] = React.useState<
    QueryModelField[]
  >([]);
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
          <pre className="mt-2 w-[340px] rounded-md bg-code-bg p-4">
            <code className="text-code-text">
              {JSON.stringify(data, null, 2)}
            </code>
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

  const operationMeta = getOperationMeta(operation);
  const endpointPath = getEndpointPath(queryName);
  const findConditionCount = countConditions(form.watch('query'));

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
                    <QueryConditionGroup
                      modelFields={modelFields}
                      operation={operation}
                    />

                    {supportsSetConditions && (
                      <>
                        <Separator />
                        <QueryAssignments
                          fields={setConditions}
                          modifiableFields={modifiableFields}
                          operationLabel={operationMeta.label}
                          onAdd={() =>
                            appendSetCondition({
                              schemaField: '',
                              action: AssignmentActionEnum.ASSIGN,
                              assignmentField: {
                                type:
                                  (form.getValues('inputs') ?? []).length > 0
                                    ? ValueSourceTypeEnum.INPUT
                                    : ValueSourceTypeEnum.CUSTOM,
                                value: '',
                              },
                            })
                          }
                          onRemove={removeSetCondition}
                        />
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
                <div className="text-sm text-muted-foreground tabular-nums">
                  {findConditionCount} find condition
                  {findConditionCount !== 1 ? 's' : ''} and
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
