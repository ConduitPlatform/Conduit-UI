'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export interface UrlTagInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'name' | 'defaultValue'
  > {
  name: TName;
  label?: string;
  description?: string;
  placeholder?: string;
}

export function UrlTagInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder = 'Add URL and press Enter or Space...',
  className,
  disabled,
  ...props
}: Readonly<UrlTagInputProps<TFieldValues, TName>>) {
  const formContext = useFormContext<TFieldValues>();

  if (!formContext) {
    throw new Error('UrlTagInput must be used within a FormProvider');
  }

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <Controller
        control={formContext.control}
        name={name}
        //@ts-ignore
        render={({ field }) => (
          <UrlTagInputField
            {...field}
            disabled={disabled}
            placeholder={placeholder}
            {...props}
          />
        )}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

interface UrlTagInputFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  > {
  value: string[];
  onChange: (value: string[]) => void;
}

function UrlTagInputField({
  value = [],
  onChange,
  placeholder,
  disabled,
  ...props
}: Readonly<UrlTagInputFieldProps>) {
  const [inputValue, setInputValue] = React.useState('');
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or Space
    if ((e.key === 'Enter' || e.key === ' ') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
      setInputValue('');
    }
    // Delete last tag on Backspace if input is empty
    else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  const addTag = (tag: string) => {
    if (editingIndex !== null) {
      // Update existing tag
      const newTags = [...value];
      newTags[editingIndex] = tag;
      onChange(newTags);
      setEditingIndex(null);
    } else {
      // Add new tag
      onChange([...value, tag]);
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);

    // If removing the tag being edited, reset editing state
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEditing = (index: number) => {
    if (disabled) return;

    setEditingIndex(index);
    setInputValue(value[index]);

    // Focus the input after a short delay to allow state to update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // Focus input when editing state changes
  React.useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingIndex]);

  return (
    <FormControl>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
        {value.map((tag, index) =>
          editingIndex === index ? null : (
            <div
              key={index}
              className={cn(
                'group flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-sm',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              )}
              onDoubleClick={() => startEditing(index)}
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )
        )}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue.trim());
              setInputValue('');
            } else if (editingIndex !== null) {
              setEditingIndex(null);
              setInputValue('');
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8"
          disabled={disabled}
          {...props}
        />
      </div>
    </FormControl>
  );
}
