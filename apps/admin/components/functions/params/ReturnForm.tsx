'use client';

import { useFormContext } from 'react-hook-form';
import { InputField } from '@/components/ui/form-inputs/InputField';
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { ReturnTypesEnum } from '@/components/functions/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const ParamsEnumValues = Object.entries(ReturnTypesEnum);

export const ReturnParamsForm = () => {
  const [addReturn, setAddReturn] = React.useState(false);
  const form = useFormContext();

  return (
    <>
      <div className="max-h-96 space-y-1 overflow-auto">
        {addReturn && (
          <div className="flex space-x-2 items-center">
            <InputField
              fieldName={`options.http.returnTypes.name` as const}
              label={''}
              placeholder={'Key'}
            />
            <FormField
              control={form.control}
              name={`options.http.returnTypes.params.type` as const}
              render={({ field }) => (
                <FormItem className="w-full space-y-0.5">
                  <Select
                    onValueChange={value => {
                      field.onChange(value);
                      form.setValue(
                        `options.http.returnTypes.type` as const,
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
          </div>
        )}
      </div>
      <Button type="button" onClick={() => setAddReturn(!addReturn)}>
        Add Parameter
      </Button>
    </>
  );
};
