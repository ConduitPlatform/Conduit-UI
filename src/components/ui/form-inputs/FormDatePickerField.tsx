'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import DateTimePicker from '@/components/ui/date-picker/DateTimePicker';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { Matcher } from 'react-day-picker';

interface FormDatePickerFieldProps {
  fieldName: string;
  label: string;
  placeholder?: string;
  description?: string;
  showIcon?: boolean;
  disabledPopover?: boolean;
  disabledDates?: Matcher | Matcher[];
  classNames?: {
    label?: string;
    trigger?: string;
    error?: string;
    formItem?: string;
    description?: string;
    popoverContent?: string;
  };
}

export const FormDatePickerField = ({
  fieldName,
  label,
  placeholder = 'Pick a date',
  description,
  showIcon = false,
  disabledPopover = false,
  disabledDates = { after: new Date() },
  classNames: {
    label: labelClassName,
    trigger: triggerClassName,
    error: errorClassName,
    formItem: formItemClassName,
    description: descriptionClassName,
    popoverContent: popoverContentClassName,
  } = {},
}: FormDatePickerFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      name={fieldName}
      control={control}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'p-2 flex items-center gap-2 justify-start font-normal w-full',
                    triggerClassName
                  )}
                  disabled={disabledPopover}
                  type="button"
                >
                  {showIcon && (
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  )}
                  {field.value ? (
                    format(field.value, 'PPP HH:mm')
                  ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={cn(
                  'w-auto p-0 bg-background',
                  popoverContentClassName
                )}
                align="start"
              >
                <DateTimePicker
                  disabled={disabledDates}
                  selectedDate={field.value}
                  setDate={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>

          {description && (
            <FormDescription
              className={cn(
                'text-xs pl-1 text-foreground-muted font-normal mt-0.5',
                descriptionClassName
              )}
            >
              {description}
            </FormDescription>
          )}

          <FormMessage className={cn('text-xs pl-1', errorClassName)} />
        </FormItem>
      )}
    />
  );
};
