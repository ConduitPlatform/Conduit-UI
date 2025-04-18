'use client';

import * as React from 'react';
import { ReactNode, useEffect, useMemo } from 'react';
import {
  DotIcon as DragHandleDots2Icon,
  Plus,
  Save,
  Settings,
  Type,
} from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { toast } from '@/lib/hooks/use-toast';
import { ModelEditorField } from '@/components/database/modelEditor/model-editor-field';
import { defaultFields, enumTypes, fieldTypes, indexTypes } from './constants';
import { ModelSettings } from '@/components/database/modelEditor/model-settings';
import { ModelIndexField } from '@/components/database/modelEditor/model-index-field';
import { Form } from '@/components/ui/form';
import {
  createSchema,
  patchSchema,
  updateExtensions,
} from '@/lib/api/database';
import { DeclaredSchema } from '@/lib/models/database';
import { isObject } from 'lodash';

const fieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(fieldTypes.map(t => t.name) as [string, ...string[]]),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  isArray: z.boolean().default(false),
  default: z.any().optional(),
  enumValues: z.array(z.string()).optional(),
  enumType: z.enum(enumTypes).optional(),
  relatedModel: z.string().optional(),
  fields: z.array(z.lazy((): any => fieldSchema)).optional(),
});
const extendedFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  ownerModule: z.string().optional(),
  type: z.enum(fieldTypes.map(t => t.name) as [string, ...string[]]),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  isArray: z.boolean().default(false),
  default: z.any().optional(),
  enumValues: z.array(z.any()).optional(),
  enumType: z.enum(enumTypes).optional(),
  relatedModel: z.string().optional(),
  fields: z.array(z.lazy((): any => fieldSchema)).optional(),
});

const indexSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Index name is required'),
  type: z.enum(indexTypes),
  fields: z.array(z.string()).min(1, 'At least one field is required'),
  unique: z.boolean().default(false),
  sparse: z.boolean().default(false),
});

const modelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  fields: z.array(fieldSchema),
  extendedFields: z.array(extendedFieldSchema),
  indices: z.array(indexSchema),
  crudOperations: z.object({
    create: z.object({ enabled: z.boolean(), requiresAuth: z.boolean() }),
    read: z.object({ enabled: z.boolean(), requiresAuth: z.boolean() }),
    update: z.object({ enabled: z.boolean(), requiresAuth: z.boolean() }),
    delete: z.object({ enabled: z.boolean(), requiresAuth: z.boolean() }),
  }),
  authorizationEnabled: z.boolean(),
});

type ModelFormValues = z.infer<typeof modelSchema>;

const extractFields = (fields: DeclaredSchema['fields']): any[] => {
  return Object.entries(fields).map(([name, field]: [string, any]) => {
    if (typeof field === 'string') {
      return {
        type: field,
        id: `${name}_${field}`,
        name,
      };
    } else if (isObject(field) && !field.hasOwnProperty('type')) {
      const group = {
        type: 'Group',
        fields: extractFields(field),
        id: `${name}_Group`,
        name,
      };
      return group;
    } else {
      return {
        ...field,
        id: `${name}_${field.type}`,
        name,
      };
    }
  });
};

export function ModelEditor({
  children,
  schema,
}: Readonly<{ children: ReactNode; schema?: DeclaredSchema }>) {
  const extensionOnly = useMemo<boolean>(
    () => !!(schema && schema.ownerModule !== 'database'),
    [schema]
  );
  const [availableModels, setAvailableModels] = React.useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<
    'fields' | 'extendedFields' | 'indices' | 'settings' | string
  >('fields');
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const existingFieldNames = Object.keys(schema?.fields ?? {});
  const incomingFields: any[] | undefined = useMemo(() => {
    if (schema) {
      return extractFields(schema.fields);
    } else {
      return undefined;
    }
  }, [schema]);
  const incomingExtendedFields = useMemo(() => {
    if (schema) {
      let fields = [];
      for (const extension of schema.extensions) {
        fields.push(
          ...Object.entries(extension.fields).map(
            ([name, field]: [string, any]) => {
              return {
                ...field,
                id: `${name}_${field.type}`,
                name,
                ownerModule: extension.ownerModule,
              };
            }
          )
        );
      }
      return fields;
    } else {
      return undefined;
    }
  }, [schema]);
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {},
  });
  useEffect(() => {
    if (schema) {
      form.reset({
        name: schema ? schema.name : '',
        fields:
          incomingFields ??
          defaultFields.map(field => ({
            ...field,
            id: `${field.name}_${field.type}`,
          })),
        extendedFields: incomingExtendedFields ?? [],
        indices: [],
        crudOperations: {
          create: {
            enabled:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.create
                ?.enabled ?? false,
            requiresAuth:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.create
                ?.authenticated ?? false,
          },
          read: {
            enabled:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.read
                ?.enabled ?? false,
            requiresAuth:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.read
                ?.authenticated ?? false,
          },
          update: {
            enabled:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.update
                ?.enabled ?? false,
            requiresAuth:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.update
                ?.authenticated ?? false,
          },
          delete: {
            enabled:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.delete
                ?.enabled ?? false,
            requiresAuth:
              schema?.modelOptions?.conduit?.cms?.crudOperations?.delete
                ?.authenticated ?? false,
          },
        },
        authorizationEnabled:
          schema?.modelOptions?.conduit?.authorization?.enabled ?? false,
      });
    } else {
      form.reset({});
    }
  }, [schema]);

  const {
    fields,
    append: appendField,
    remove: removeField,
    move: moveField,
  } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const {
    fields: indices,
    append: appendIndex,
    remove: removeIndex,
    move: moveIndex,
  } = useFieldArray({
    control: form.control,
    name: 'indices',
  });

  const {
    fields: extendedFields,
    append: appendExtendedField,
    remove: removeExtendedField,
    move: moveExtendedField,
  } = useFieldArray({
    control: form.control,
    name: 'extendedFields',
  });
  const { selectedItem, selectedIndex } = useMemo(() => {
    if (activeTab === 'fields') {
      const index = fields.findIndex(f => f.id === selectedItemId);
      return {
        selectedItem: fields[index],
        selectedIndex: index,
      };
    }
    if (activeTab === 'extendedFields') {
      const index = extendedFields.findIndex(f => f.id === selectedItemId);
      return {
        selectedItem: extendedFields[index],
        selectedIndex: index,
      };
    } else {
      const index = indices.findIndex(f => f.id === selectedItemId);
      return {
        selectedItem: indices[index],
        selectedIndex: index,
      };
    }
  }, [fields, extendedFields, selectedItemId, activeTab, indices]);

  const onSubmit = async (data: ModelFormValues) => {
    const fieldsObject: { [key: string]: any } = {};

    if (extensionOnly) {
      let fields = data.extendedFields.filter(
        field => field.ownerModule === 'database'
      );
      fields.forEach(field => {
        const newField = { ...field };
        if (newField.fields && newField.fields.length > 0) {
          newField.fields = newField.fields.map(f => {
            delete f.id;
            return f;
          });
        }
        // @ts-ignore
        delete newField.id;
        // @ts-ignore
        delete newField.ownerModule;
        fieldsObject[newField.name] = newField;
      });
      await updateExtensions(schema!._id, fieldsObject);
      toast({
        title: 'Model saved',
        description: `Model ${schema!.name} has been successfully updated`,
      });
      setIsEditorOpen(false);
      setHasUnsavedChanges(false);
      return;
    }
    // besides removing the id fields as below, also turn the fields array into an object, with each field name as the key
    data.fields.forEach(field => {
      const newField = { ...field };
      if (newField.fields && newField.fields.length > 0) {
        newField.fields = newField.fields.map(f => {
          delete f.id;
          return f;
        });
      }
      // @ts-ignore
      delete newField.id;
      fieldsObject[newField.name] = newField;
    });
    let request = {
      fields: fieldsObject,
      conduitOptions: {
        cms: {
          enabled: true,
          crudOperations: {
            create: {
              enabled: data.crudOperations.create.enabled ?? false,
              authenticated: data.crudOperations.create.requiresAuth ?? false,
            },
            read: {
              enabled: data.crudOperations.read.enabled ?? false,
              authenticated: data.crudOperations.read.requiresAuth ?? false,
            },
            update: {
              enabled: data.crudOperations.update.enabled ?? false,
              authenticated: data.crudOperations.update.requiresAuth ?? false,
            },
            delete: {
              enabled: data.crudOperations.delete.enabled ?? false,
              authenticated: data.crudOperations.delete.requiresAuth ?? false,
            },
          },
        },
        permissions: {
          extendable: true,
          canCreate: true,
          canModify: 'Everything',
          canDelete: true,
        },
        authorization: {
          enabled: data.authorizationEnabled,
        },
      },
    };
    if (schema) {
      await patchSchema(schema._id, request);
      toast({
        title: 'Model saved',
        description: `Model ${schema.name} has been successfully updated`,
      });
    } else {
      await createSchema({
        name: data.name,
        ...request,
      });
      setAvailableModels([...availableModels, data.name]);
      toast({
        title: 'Model created',
        description: `Model ${data.name} has been successfully created`,
      });
    }
    setIsEditorOpen(false);
    setHasUnsavedChanges(false);
  };

  const onFieldDragEnd = (result: any) => {
    if (!result.destination) return;
    moveField(result.source.index, result.destination.index);
  };
  const onExtendedFieldDragEnd = (result: any) => {
    if (!result.destination) return;
    moveExtendedField(result.source.index, result.destination.index);
  };

  const onIndexDragEnd = (result: any) => {
    if (!result.destination) return;
    moveIndex(result.source.index, result.destination.index);
  };

  const filteredFields = fields.filter(field =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredExtendedFields = extendedFields.filter(field =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredIndices = indices.filter(index =>
    index.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFieldItem = (
    field: any,
    index: number,
    disableEdits: boolean = false
  ) => {
    const isDefaultField = defaultFields.some(df => df.name === field.name);
    const FieldIcon = fieldTypes.find(t => t.name === field.type)?.icon || Type;

    return (
      <Draggable
        key={field.id}
        draggableId={field.id}
        index={index}
        isDragDisabled={isDefaultField || disableEdits}
      >
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center p-2 mb-2 rounded-md cursor-pointer ${selectedItemId === field.id ? 'bg-accent' : 'hover:bg-accent'}`}
            onClick={() => setSelectedItemId(field.id)}
          >
            <DragHandleDots2Icon className="w-4 h-4 mr-2" />
            <FieldIcon className="w-4 h-4 mr-2" />
            <span className="flex-grow">{field.name || 'Unnamed Field'}</span>
            {disableEdits && <Badge variant="outline">view only</Badge>}
            {field.hasOwnProperty('ownerModule') && (
              <Badge variant="outline">{field.ownerModule}</Badge>
            )}
            <Badge variant="outline">{field.type}</Badge>
          </div>
        )}
      </Draggable>
    );
  };

  const renderIndexItem = (index: any, idx: number) => {
    return (
      <Draggable key={index.id} draggableId={index.id} index={idx}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center p-2 mb-2 rounded-md cursor-pointer ${selectedItemId === index.id ? 'bg-accent' : 'hover:bg-accent'}`}
            onClick={() => setSelectedItemId(index.id)}
          >
            <DragHandleDots2Icon className="w-4 h-4 mr-2" />
            <span className="flex-grow">{index.name || 'Unnamed Index'}</span>
            <Badge variant="outline">{index.type}</Badge>
          </div>
        )}
      </Draggable>
    );
  };

  const handleEditorClose = (open: boolean) => {
    if (open) {
      setIsEditorOpen(true);
      setIsAlertOpen(false);
    } else {
      if (hasUnsavedChanges) {
        setIsAlertOpen(true);
      } else {
        setIsEditorOpen(false);
      }
    }
  };

  React.useEffect(() => {
    const isDirty = form.formState.isDirty;
    if (isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [form]);

  return (
    <>
      <Sheet open={isEditorOpen} onOpenChange={handleEditorClose}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Model Editor</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-4 border-b">
                <Input
                  placeholder="Model Name"
                  {...form.register('name')}
                  className="text-2xl font-bold w-auto"
                  disabled={!!schema}
                />
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Model
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="fields">Fields</TabsTrigger>
                        {extensionOnly && (
                          <TabsTrigger value="extendedFields">
                            Extensions
                          </TabsTrigger>
                        )}
                        <TabsTrigger value="indices">Indices</TabsTrigger>
                        <TabsTrigger value="settings">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="fields">
                        <DragDropContext onDragEnd={onFieldDragEnd}>
                          <Droppable droppableId="fields">
                            {provided => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {filteredFields.map((field, index) =>
                                  renderFieldItem(field, index, extensionOnly)
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </TabsContent>
                      <TabsContent value="extendedFields">
                        <DragDropContext onDragEnd={onExtendedFieldDragEnd}>
                          <Droppable droppableId="extendedFields">
                            {provided => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {filteredExtendedFields.map((field, index) =>
                                  renderFieldItem(
                                    field,
                                    index,
                                    field.ownerModule !== 'database'
                                  )
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </TabsContent>
                      <TabsContent value="indices">
                        <DragDropContext onDragEnd={onIndexDragEnd}>
                          <Droppable droppableId="indices">
                            {provided => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {filteredIndices.map((index, idx) =>
                                  renderIndexItem(index, idx)
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </TabsContent>
                    </Tabs>
                  </ScrollArea>
                  <div className="sticky bottom-0 bg-background pt-2">
                    {activeTab === 'fields' && !extensionOnly && (
                      <Button
                        type="button"
                        onClick={() => {
                          const newId = `${Math.random().toString(36).substring(2, 9)}`;
                          const newField = {
                            id: newId,
                            name: '',
                            type: 'String',
                            required: false,
                            unique: false,
                            isArray: false,
                          };
                          appendField(newField);
                          setSelectedItemId(newId);
                        }}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                    )}
                    {activeTab === 'extendedFields' && (
                      <Button
                        type="button"
                        onClick={() => {
                          const newId = `${Math.random().toString(36).substring(2, 9)}`;
                          const newField = {
                            id: newId,
                            name: '',
                            type: 'String',
                            ownerModule: 'database',
                            required: false,
                            unique: false,
                            isArray: false,
                          };
                          appendExtendedField(newField);
                          setSelectedItemId(newId);
                        }}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Extension
                      </Button>
                    )}
                    {activeTab === 'indices' && (
                      <Button
                        type="button"
                        onClick={() => {
                          const newId = `${Math.random().toString(36).substring(2, 9)}`;
                          const newIndex = {
                            id: newId,
                            name: '',
                            type: 'Single Field',
                            fields: [],
                            unique: false,
                            sparse: false,
                          };
                          // @ts-ignore
                          appendIndex(newIndex);
                          setSelectedItemId(newId);
                        }}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Index
                      </Button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-3">
                  {activeTab === 'fields' && selectedItem && (
                    <ModelEditorField
                      key={selectedItemId}
                      form={form}
                      field={selectedItem}
                      index={selectedIndex}
                      removeField={removeField}
                      availableModels={availableModels}
                      disabled={extensionOnly}
                      mode={
                        existingFieldNames.includes(selectedItem.name)
                          ? 'edit'
                          : 'new'
                      }
                    />
                  )}
                  {activeTab === 'extendedFields' && selectedItem && (
                    <ModelEditorField
                      key={selectedItemId}
                      form={form}
                      field={selectedItem}
                      index={selectedIndex}
                      removeField={removeExtendedField}
                      availableModels={availableModels}
                      extended
                      disabled={
                        (selectedItem as any).ownerModule !== 'database'
                      }
                      mode={
                        existingFieldNames.includes(selectedItem.name)
                          ? 'edit'
                          : 'new'
                      }
                    />
                  )}
                  {activeTab === 'indices' && selectedItem && (
                    <ModelIndexField
                      key={selectedItemId}
                      index={selectedItem}
                      idx={selectedIndex}
                      form={form}
                      removeIndex={removeIndex}
                    />
                  )}
                  {activeTab === 'settings' && <ModelSettings form={form} />}
                </div>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsEditorOpen(false);
                setIsAlertOpen(false);
                setHasUnsavedChanges(false);
              }}
            >
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
