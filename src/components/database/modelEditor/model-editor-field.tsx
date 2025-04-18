import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';
import { useMemo } from 'react';
import { defaultFields, enumTypes, fieldTypes } from './constants';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';

const generateKey = (fieldId: string, subFieldName: string) => {
  return `${fieldId}_${subFieldName}`;
};

export const ModelEditorField = ({
  form,
  field,
  index,
  removeField,
  availableModels,
  mode = 'new',
  disabled,
  extended,
  fieldPath: parentPath,
}: {
  form: any;
  field: any;
  index: number;
  fieldPath?: string;
  availableModels: string[];
  removeField: (index: number) => void;
  mode?: 'new' | 'edit';
  disabled: boolean;
  extended?: boolean;
}) => {
  debugger;
  const fieldPath = useMemo(
    () =>
      parentPath
        ? `${parentPath}.${index}`
        : `${extended ? 'extendedFields' : 'fields'}.${index}`,
    [index, parentPath]
  );
  const fieldId = useMemo(
    () => field?.id ?? `${extended ? 'extendedFields' : 'fields'}.${index}`,
    [field]
  );
  const isDefaultField = defaultFields.some(df => df.name === field?.name);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 space-y-0">
            <InputField
              key={generateKey(fieldId, `${fieldPath}.name`)}
              label={''}
              placeholder="Field name"
              fieldName={`${fieldPath}.name`}
              className={'mt-2'}
              disabled={mode === 'edit' || isDefaultField || disabled}
            />
            <SelectField
              key={generateKey(fieldId, `${fieldPath}.type`)}
              label={''}
              fieldName={`${fieldPath}.type`}
              placeholder={'Type'}
              options={fieldTypes.map(type => {
                return {
                  label: (
                    <div className="flex items-center">
                      <type.icon className="w-4 h-4 mr-2" />
                      {type.name}
                    </div>
                  ),
                  value: type.name,
                };
              })}
              disabled={mode === 'edit' || disabled}
            />
          </div>
          {['Boolean', 'String', 'Number'].includes(
            form.watch(`${fieldPath}.type`)
          ) && (
            <div>
              <InputField
                key={generateKey(fieldId, `${fieldPath}.default`)}
                label={'Default Value'}
                fieldName={`${fieldPath}.default`}
                disabled={disabled}
              />
            </div>
          )}
          {form.watch(`${fieldPath}.type`) === 'Enum' && (
            <>
              <SelectField
                key={generateKey(fieldId, `${fieldPath}.enumType`)}
                label={'Enum Type'}
                options={enumTypes.map(type => ({ label: type, value: type }))}
                fieldName={`${fieldPath}.enumType`}
                disabled={disabled}
              />
              <InputField
                key={generateKey(fieldId, `${fieldPath}.enumValues`)}
                label={'Enum Values (comma-separated)'}
                fieldName={`${fieldPath}.enumValues`}
                disabled={disabled}
              />
            </>
          )}
          {/*// @ts-ignore*/}
          {form.watch(`${fieldPath}.type`) === 'Relation' && (
            <div key={generateKey(fieldId, `${fieldPath}.type`)}>
              <Label htmlFor={`${fieldPath}.relatedModel`}>Related Model</Label>
              <Dialog>
                <DialogTrigger asChild disabled={disabled}>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={disabled}
                  >
                    {/*// @ts-ignore*/}
                    {form.watch(`${fieldPath}.relatedModel`) ||
                      'Select Related Model'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Related Model</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[200px]">
                    {availableModels.map(model => (
                      <Button
                        key={model}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          // @ts-ignore
                          form.setValue(`${fieldPath}.relatedModel`, model);
                        }}
                      >
                        {model}
                      </Button>
                    ))}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          )}
          {form.watch(`${fieldPath}.type`) === 'Group' && (
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  const newId = `${Math.random().toString(36).substring(2, 9)}`;
                  // @ts-ignore
                  const groupFields =
                    form.getValues(`${fieldPath}.fields`) || [];
                  // @ts-ignore
                  form.setValue(`${fieldPath}.fields`, [
                    ...groupFields,
                    {
                      id: newId,
                      name: '',
                      type: 'String',
                      required: false,
                      unique: false,
                      isArray: false,
                    },
                  ]);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Nested Field
              </Button>
              <div className="ml-4 mt-2">
                {form
                  // @ts-ignore
                  .watch(`${fieldPath}.fields`)
                  ?.map((nestedField: any, nestedIndex: number) => (
                    <ModelEditorField
                      key={`${field.id}_${nestedField.id}`}
                      form={form}
                      fieldPath={`${fieldPath}.fields`}
                      field={nestedField}
                      index={nestedIndex}
                      removeField={removeField}
                      availableModels={availableModels}
                      disabled={disabled}
                    />
                  ))}
              </div>
            </div>
          )}
          {!isDefaultField && (
            <div className={'flex flex-row justify-between items-center'}>
              <div className="flex items-center space-x-2">
                <SwitchField
                  key={generateKey(fieldId, `${fieldPath}.required`)}
                  fieldName={`${fieldPath}.required`}
                  label={'Required'}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-center space-x-2">
                <SwitchField
                  key={generateKey(fieldId, `${fieldPath}.unique`)}
                  fieldName={`${fieldPath}.unique`}
                  label={'Unique'}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-center space-x-2">
                <SwitchField
                  key={generateKey(fieldId, `${fieldPath}.isArray`)}
                  fieldName={`${fieldPath}.isArray`}
                  label={'Is Array'}
                  disabled={mode === 'edit' || disabled}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                disabled={disabled}
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
