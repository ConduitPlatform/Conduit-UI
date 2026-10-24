'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { GetMiddlewaresResponseType } from '@/app/(dashboard)/(modules)/functions/functions/new/page';

type OptionsFormProps = {
  middlewares: GetMiddlewaresResponseType;
  children?: React.ReactNode;
};

export const OptionsForm = ({ middlewares, children }: OptionsFormProps) => {
  const form = useFormContext();
  return (
    <div className="flex flex-col space-y-6">
      {children}
      <div className="flex flex-col space-y-4">
        <div>
          <FormLabel className="text-base">Middlewares</FormLabel>
          <FormDescription>
            Select middlewares you want to apply to this function.
          </FormDescription>
        </div>
        <div className="flex-col items-center space-y-1.5">
          {middlewares.map(middleware => (
            <FormField
              key={middleware}
              control={form.control}
              name="options.middlewares"
              render={({ field }) => {
                return (
                  <FormItem
                    key={middleware}
                    className="flex items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(middleware)}
                        onCheckedChange={checked => {
                          return checked
                            ? field.onChange([...field.value, middleware])
                            : field.onChange(
                                field.value?.filter(
                                  (value: string) => value !== middleware
                                )
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{middleware}</FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
