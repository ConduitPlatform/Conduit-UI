import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface TextAreaWithLabel extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  fieldName: string;
  classNames?: {
    label?: string;
    input?: string;
    formItem?: string;
  };
}

export const TextAreaField = ({
  label,
  fieldName,
  placeholder,
  classNames: {
    label: labelClassName,
    input: inputClassName,
    formItem: formItemClassName,
  } = {},
  ...restInputProps
}: TextAreaWithLabel) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={cn('w-full space-y-1.5', formItemClassName)}>
          <FormLabel
            className={cn(
              'flex gap-2 pl-1 text-base font-medium text-foreground',
              labelClassName
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              className={inputClassName}
              placeholder={placeholder}
              {...field}
              {...restInputProps}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
