'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { TrashIcon } from 'lucide-react';
import { ParamsEnum } from '@/components/functions/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ParamsEnumValues = Object.entries(ParamsEnum);

export const UrlParamsForm = () => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options.http.urlParams',
  });

  return (
    <>
      <div className="max-h-96 space-y-1 overflow-auto">
        {fields.map((field, index) => (
          <div className="flex space-x-2 items-center" key={field.id}>
            <InputField
              fieldName={`options.http.urlParams.${index}.params.name` as const}
              label={''}
              placeholder={'Key'}
            />
            <FormField
              control={form.control}
              name={`options.http.urlParams.${index}.params.type` as const}
              render={({ field }) => (
                <FormItem className="w-full space-y-0.5">
                  <Select
                    onValueChange={value => {
                      field.onChange(value);
                      form.setValue(
                        `options.http.urlParams.${index}.params.type` as const,
                        value
                      );
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ParamsEnumValues.map(([key, value]) => (
                        <SelectItem value={value}>
                          <div className={'flex items-center gap-2'}>{key}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs pl-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`options.http.urlParams.${index}.required` as const}
              render={({ field }) => {
                return (
                  <FormItem className="flex items-start space-x-1 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.required}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Required</FormLabel>
                  </FormItem>
                );
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        onClick={() =>
          append({
            required: false,
            params: { name: undefined, type: undefined },
          })
        }
      >
        Add Parameter
      </Button>
    </>
  );
};
