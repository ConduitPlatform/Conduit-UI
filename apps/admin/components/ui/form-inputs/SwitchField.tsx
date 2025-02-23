'use client';
import { SwitchProps } from '@radix-ui/react-switch';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import React from 'react';

interface SwitchFieldProps extends SwitchProps {
  label?: string;
  fieldName: string;
  className?: string;
  classNames?: {
    label?: string;
    error?: string;
  };
}

const SwitchField = ({
  label,
  fieldName,
  className,
  classNames,
  children,
  ...switchRestProps
}: SwitchFieldProps) => {
  const { label: labelClassName, error: errorClassName } = classNames ?? {};
  const { control } = useFormContext();

  return (
    <FormField
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormItem className={cn(className, { 'py-2 px-4': !!children })}>
          {children}
          <div className="flex flex-row gap-2 items-center">
            {label && (
              <FormLabel>
                <p className={cn('text-text-dark-gray', labelClassName)}>
                  {label}
                </p>
              </FormLabel>
            )}
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                {...switchRestProps}
              />
            </FormControl>
          </div>
          <FormMessage className={cn('pl-2', errorClassName)} />
        </FormItem>
      )}
    ></FormField>
  );
};

export default SwitchField;
