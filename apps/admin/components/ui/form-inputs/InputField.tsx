'use client';
import { cn } from '@/lib/utils';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import TooltipHelper from '../helpers/TooltipHelper';
import { InfoIcon } from '@/icons';
import { useFormContext } from 'react-hook-form';
import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  info?: string;
  label: string;
  fieldName: string;
  description?: string;
  classNames?: {
    label?: string;
    input?: string;
    error?: string;
    formItem?: string;
    description?: string;
  };
}

const InputField = ({
                      fieldName,
                      label,
                      info,
                      type = 'text',
                      description,
                      placeholder,
                      classNames: {
                        label: labelClassName,
                        input: inputClassName,
                        error: errorClassName,
                        formItem: formItemClassName,
                        description: descriptionClassName,
                      } = {},
                      ...restInputProps
                    }: InputFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormItem
          className={cn('w-full space-y-0.5', formItemClassName)}
        >
          <FormLabel
            className={cn(
              'flex gap-2 pl-1 text-base font-medium text-text-body',
              labelClassName,
            )}
          >
            {label}
            {info && (
              <TooltipHelper content={info}>
                <InfoIcon />
              </TooltipHelper>
            )}
          </FormLabel>

          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              {...restInputProps}
              className={inputClassName}
            />
          </FormControl>

          {description && (
            <FormDescription
              className={cn(
                'text-xs pl-1 text-text-dark-gray font-normal mt-0.5',
                descriptionClassName,
              )}
            >
              {description}
            </FormDescription>
          )}

          <FormMessage
            className={cn('text-xs pl-1', errorClassName)}
          />
        </FormItem>
      )}
    />
  );
};

export { InputField };
