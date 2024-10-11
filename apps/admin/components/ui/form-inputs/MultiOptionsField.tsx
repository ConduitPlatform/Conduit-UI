'use client';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandProps,
} from '@/components/ui/command';
import { useCallback, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Command } from 'cmdk';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface MultiOptionsFieldProps extends CommandProps {
  label: string;
  fieldName: string;
  description?: string;
  placeholder?: string;
  options?: Option[];
  className?: string;
  classNames?: {
    selectItem?: string;
    input?: string;
    badge?: string;
    label?: string;
    error?: string;
    description?: string;
    selectTrigger?: string;
  };
}

const MultiOptionsField = ({
  fieldName,
  label,
  description,
  className,
  placeholder = 'Select options',
  options,
  classNames: {
    badge: badgeClassName,
    label: labelClassName,
    error: errorClassName,
    input: inputClassName,
    selectTrigger: selectTriggerClassName,
    selectItem: selectItemClassName,
    description: descriptionClassName,
  } = {},
  ...restProps
}: MultiOptionsFieldProps) => {
  const { control } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [inputValue, setInputValue] = useState<string | undefined>('');

  const handleUnselect = useCallback((option: Option) => {
    setSelectedOptions(prev => prev.filter(s => s.value !== option.value));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (
          (e.key === 'Delete' || e.key === 'Backspace') &&
          input.value === ''
        ) {
          setSelectedOptions(prev => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
          });
        }
        if (e.key === 'Escape') {
          input.blur();
        }
        if (e.key === 'Enter') {
          setOpen(!open);
        }
      }
    },
    []
  );

  const filteredOptions = options?.filter(
    option => !selectedOptions.some(selected => selected.value === option.value)
  );

  const handleSelect = (option: Option) => {
    setInputValue('');
    setSelectedOptions(prev => [...prev, option]);
  };
  return (
    <FormField
      name={fieldName}
      control={control}
      render={() => (
        <FormItem className={className}>
          <FormLabel className={labelClassName}>{label}</FormLabel>
          <FormControl>
            <Command
              onKeyDown={handleKeyDown}
              className={'overflow-visible bg-transparent relative flex-1'}
            >
              <button
                className={cn(
                  'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent pl-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5',
                  selectTriggerClassName
                )}
                type="button"
                onClick={() => setOpen(!open)}
              >
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map(option => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className={cn('flex gap-1', badgeClassName)}
                    >
                      {option.label}
                      <button
                        className="flex items-center justify-center p-[3px] -mr-1 rounded-md outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={e =>
                          e.key === 'Enter' && handleUnselect(option)
                        }
                        onMouseDown={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => handleUnselect(option)}
                        type="button"
                      >
                        <X className="flex-shrink-0 w-3 h-3 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </Badge>
                  ))}
                  {filteredOptions && filteredOptions.length > 0 && (
                    <Command.Input
                      ref={inputRef}
                      value={inputValue}
                      onValueChange={setInputValue}
                      onBlur={() => setOpen(false)}
                      placeholder={placeholder}
                      className={cn(
                        'flex-1 bg-transparent outline-none placeholder:text-primary',
                        inputClassName
                      )}
                      {...restProps}
                    />
                  )}
                </div>
              </button>
              <button
                onClick={() => setSelectedOptions([])}
                className="absolute flex items-center justify-center transform -translate-x-1 -translate-y-1/2 rounded-md outline-none top-1/2 right-1 ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                type="button"
              >
                <X className="flex-shrink-0 w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
              {open && filteredOptions && filteredOptions.length > 0 && (
                <div className="relative">
                  <CommandList>
                    <div className="absolute z-10 w-full border rounded-md shadow-md outline-none top-1 bg-background animate-in">
                      <CommandEmpty>
                        <div className="p-2 text-sm text-center text-muted-foreground">
                          No matches found
                        </div>
                      </CommandEmpty>
                      <CommandGroup className="h-full overflow-auto">
                        {filteredOptions.map(option => (
                          <CommandItem
                            key={option.value}
                            onMouseDown={e => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={() => handleSelect(option)}
                            className={cn(
                              'cursor-pointer',
                              selectItemClassName
                            )}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </div>
                  </CommandList>
                </div>
              )}
            </Command>
          </FormControl>
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

export default MultiOptionsField;
