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
import DateTimePicker, {
  DateTimePickerProps,
} from '@/components/ui/date-picker/DateTimePicker';
import { Label } from '@/components/ui/label';
import { Matcher } from 'react-day-picker';

type DatePickerFieldProps = Omit<DateTimePickerProps, 'setDate'> & {
  placeholder?: string;
  description?: string;
  label?: string;
  showIcon?: boolean;
  disabledPopover?: boolean;
  selectedDate?: Date | undefined;
  setSelectedDate?: (value: Date | undefined) => void;

  classNames?: {
    label?: string;
    input?: string;
    trigger?: string;
    error?: string;
    description?: string;
    popoverContent?: string;
  };
  disabledDates?: Matcher | Matcher[];
};

// TODO: wrap in form
export const DatePickerField = ({
  label,
  placeholder = 'Pick a date',
  selectedDate,
  setSelectedDate,
  showIcon = false,
  disabledPopover = false,
  disabledDates = { after: new Date() },

  className,
  classNames: {
    label: labelClassName,
    trigger: triggerClassName,
    popoverContent: popoverContentClassName,
  } = {},
}: DatePickerFieldProps) => {
  return (
    <div className={cn('w-full', className)}>
      {label && <Label className={labelClassName}>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
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
            {selectedDate ? (
              format(selectedDate, 'PPP HH:mm')
            ) : (
              <span className="text-muted-foreground">
                {placeholder ?? 'Pick a date'}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn('w-auto p-0 bg-background', popoverContentClassName)}
          align="start"
        >
          <DateTimePicker
            disabled={disabledDates}
            selectedDate={selectedDate}
            setDate={setSelectedDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
