'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps, type Matcher } from 'react-day-picker';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { TimePickerInput } from './TimePickerInput';
import { useRef } from 'react';

import 'react-day-picker/style.css';

type SingleModeDayPickerProps = Extract<DayPickerProps, { mode: 'single' }>;

export type DateTimePickerProps = Omit<
  SingleModeDayPickerProps,
  'mode' | 'onSelect' | 'selected'
> & {
  showTimePicker?: boolean;
  selectedDate?: Date;
  setDate?: (value: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
};

function DateTimePicker({
  className,
  classNames,
  showOutsideDays = true,
  selectedDate,
  disabled = { after: new Date() },
  setDate: setGlobalDate,
  showTimePicker: _showTimePicker,
  ...props
}: DateTimePickerProps) {
  const minuteRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);

  const handleSelect = (selected: Date | undefined) => {
    if (!setGlobalDate) return;
    if (!selected) {
      setGlobalDate(undefined);
      return;
    }
    const date = selectedDate ? new Date(selectedDate) : new Date();
    date.setDate(selected.getDate());
    date.setMonth(selected.getMonth());
    date.setFullYear(selected.getFullYear());
    setGlobalDate(date);
  };

  const setTime = (dateInput: Date | undefined) => {
    if (!dateInput) return;
    const time = new Date(selectedDate ?? new Date());
    time.setHours(dateInput.getHours());
    time.setMinutes(dateInput.getMinutes());
    setGlobalDate && setGlobalDate(time);
  };

  return (
    <>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        disabled={disabled}
        showOutsideDays={showOutsideDays}
        className={cn('p-3 border-input', className)}
        classNames={{
          months:
            'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          month_caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-sm font-medium',
          nav: 'space-x-1 flex items-center',
          button_previous: cn(
            buttonVariants({ variant: 'outline' }),
            'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          ),
          button_next: cn(
            buttonVariants({ variant: 'outline' }),
            'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          ),
          month_grid: 'w-full border-collapse space-y-1',
          weekdays: 'flex',
          weekday:
            'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          week: 'flex w-full',
          day: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          day_button: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
          ),
          range_end: 'range-end',
          selected:
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          today: 'bg-accent text-accent-foreground',
          outside:
            'outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
          disabled: 'text-muted-foreground opacity-50',
          range_middle:
            'aria-selected:bg-accent aria-selected:text-accent-foreground',
          hidden: 'invisible',
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation, className: chevronClassName }) => {
            if (orientation === 'left') {
              return (
                <ChevronLeft className={cn('h-4 w-4', chevronClassName)} />
              );
            }
            if (orientation === 'right') {
              return (
                <ChevronRight className={cn('h-4 w-4', chevronClassName)} />
              );
            }
            return (
              <span className={cn('inline-block h-4 w-4', chevronClassName)} />
            );
          },
        }}
        {...props}
      />
      <hr className="my-0" />
      <div className="flex justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm font-medium">Time</p>
        </div>
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <TimePickerInput
              picker="hours"
              date={selectedDate}
              setDate={setTime}
              ref={hourRef}
              onRightFocus={() => minuteRef.current?.focus()}
            />
            <span>:</span>
            <TimePickerInput
              picker="minutes"
              date={selectedDate}
              setDate={setTime}
              ref={minuteRef}
              onLeftFocus={() => hourRef.current?.focus()}
            />
          </div>
        </div>
      </div>
    </>
  );
}

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
