'use client';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import React from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';

interface CodeFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  fieldName: string;
  placeholder: string;
  classNames?: {
    label?: string;
    input?: string;
    formItem?: string;
  };
  language?: string;
}

export const CodeField = ({
                            label,
                            fieldName,
                            placeholder,
                            classNames: {
                              label: labelClassName,
                              input: inputClassName,
                              formItem: formItemClassName,
                            } = {},
                            language = 'json',
                            ...restInputProps
                          }: CodeFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={fieldName}
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
          </FormLabel>
          <FormControl>
            <CodeEditor
              placeholder={placeholder}
              padding={15}
              language={language}
              className={cn('rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', inputClassName)}
              style={{
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
              rehypePlugins={[
                [rehypePrism, { ignoreMissing: true }],
              ]}
              {...field}
              {...restInputProps}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

