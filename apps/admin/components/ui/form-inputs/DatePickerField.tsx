'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useController, useFormContext } from 'react-hook-form';
import DateTimePicker, {
  DateTimePickerProps,
} from '@/components/ui/date-picker/DateTimePicker';

type DatePickerFieldProps = Omit<DateTimePickerProps, 'setDate'> & {
  fieldName: string;
  placeholder?: string;
  description?: string;
  label?: string;
  showIcon?: boolean;
  disabledPopover?: boolean;
  classNames?: {
    label?: string;
    input?: string;
    trigger?: string;
    error?: string;
    description?: string;
    popoverContent?: string;
  };
};

export const DatePickerField = ({
  fieldName,
  label,
  description,
  placeholder = 'Pick a date',
  showIcon = false,
  disabledPopover = false,
  className,
  classNames: {
    label: labelClassName,
    trigger: triggerClassName,
    error: errorClassName,
    description: descriptionClassName,
    popoverContent: popoverContentClassName,
  } = {},
}: DatePickerFieldProps) => {
  const { control } = useFormContext();

  const { field } = useController({
    name: fieldName,
    control,
  });

  const handleDateChange = (date: Date) => {
    field.onChange(date);
  };

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={cn('w-full', className)}>
          {label && <FormLabel className={labelClassName}>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'p-2 flex items-center gap-2 justify-start font-normal w-full',
                    label && 'border-input',
                    triggerClassName
                  )}
                  disabled={disabledPopover}
                >
                  {showIcon && (
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  )}
                  {field.value ? (
                    <p>{format(field.value, 'PPP HH:mm')}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      {placeholder ?? 'Pick a date'}
                    </p>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                'p-0 border-input w-fit bg-background',
                popoverContentClassName
              )}
              align="start"
            >
              <DateTimePicker
                selected={field.value}
                setDate={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && (
            <FormDescription className={descriptionClassName}>
              {description}
            </FormDescription>
          )}
          <FormMessage className={errorClassName} />
        </FormItem>
      )}
    />
  );
};
