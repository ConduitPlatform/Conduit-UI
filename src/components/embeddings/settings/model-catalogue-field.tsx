'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/form-inputs/InputField';
import { Input } from '@/components/ui/input';
import {
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
  EmbeddingsSettingsFormValues,
  NEW_CATALOGUE_MODEL,
  uniqueCatalogueNames,
} from '@/lib/models/embeddings/settings-form';
import { cn } from '@/lib/utils';

const NONE_DEFAULT_MODEL = '__none__';

type ModelCatalogueFieldProps = {
  disabled: boolean;
};

export function ModelCatalogueField({ disabled }: ModelCatalogueFieldProps) {
  const { control, setValue } = useFormContext<EmbeddingsSettingsFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'models',
  });
  const models = useWatch({ control, name: 'models' }) ?? [];
  const defaultModel = useWatch({ control, name: 'defaultModel' }) ?? '';
  const selectableNames = uniqueCatalogueNames(models);
  const selectedDefault = defaultModel.trim();

  const removeModel = (index: number) => {
    const rowName = models[index]?.name?.trim() ?? '';
    if (selectedDefault && rowName === selectedDefault) return;
    if (fields.length <= 1) return;
    remove(index);
  };

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Models</h3>
          <p className="mt-1 text-xs text-muted-foreground text-pretty">
            Each model needs a unique name and the number of dimensions it
            produces. Configs choose from this list.
          </p>
        </div>
        <ul className="space-y-3">
          {fields.map((field, index) => {
            const rowName = models[index]?.name?.trim() ?? '';
            const isSelectedDefault =
              Boolean(selectedDefault) && rowName === selectedDefault;
            const isLastRow = fields.length <= 1;
            const removeBlocked = isSelectedDefault || isLastRow;
            const removeLabel = isSelectedDefault
              ? 'Clear or change the default model before removing this row'
              : isLastRow
                ? 'At least one model is required'
                : `Remove ${rowName || `model ${index + 1}`}`;

            return (
              <li
                key={field.id}
                className="grid gap-3 rounded-md border border-border/60 bg-surface-1 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
              >
                <FormField
                  control={control}
                  name={`models.${index}.name`}
                  render={({ field: nameField }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>Model name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="text-embedding-3-small"
                          disabled={disabled}
                          autoComplete="off"
                          name={nameField.name}
                          value={nameField.value}
                          ref={nameField.ref}
                          onBlur={nameField.onBlur}
                          onChange={event => {
                            const previousName = nameField.value;
                            nameField.onChange(event);
                            if (
                              selectedDefault &&
                              previousName.trim() === selectedDefault
                            ) {
                              setValue('defaultModel', event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <InputField
                  fieldName={`models.${index}.dimensions`}
                  label="Dimensions"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  disabled={disabled}
                  autoComplete="off"
                />
                <span
                  className="inline-flex"
                  title={removeBlocked ? removeLabel : undefined}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={disabled || removeBlocked}
                    aria-label={removeLabel}
                    onClick={() => removeModel(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </span>
              </li>
            );
          })}
        </ul>
        <Button
          type="button"
          variant="outline"
          className="min-h-8 gap-2"
          disabled={disabled}
          onClick={() => append({ ...NEW_CATALOGUE_MODEL })}
        >
          <Plus className="size-4" aria-hidden />
          Add model
        </Button>
      </div>
      <FormField
        control={control}
        name="defaultModel"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel>Default model</FormLabel>
            <Select
              onValueChange={value =>
                field.onChange(value === NONE_DEFAULT_MODEL ? '' : value)
              }
              value={field.value || NONE_DEFAULT_MODEL}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger
                  className={cn('h-8 min-h-8 text-[13px]')}
                  aria-label="Default model"
                >
                  <SelectValue placeholder="None" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NONE_DEFAULT_MODEL}>None</SelectItem>
                {selectableNames.map(name => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription className="text-xs">
              Optional. Used when a config does not set its own model.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
