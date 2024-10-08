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
        <FormItem>
          <FormLabel className={labelClassName}>{label}</FormLabel>
          <FormControl>
            <Command
              onKeyDown={handleKeyDown}
              className={'overflow-visible bg-transparent'}
            >
              <button
                className={cn(
                  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5'
                )}
                type="button"
              >
                <div className="flex gap-1">
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
                      onFocus={() => setOpen(true)}
                      placeholder={placeholder}
                      className={cn(
                        'flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
                        inputClassName
                      )}
                      {...restProps}
                    />
                  )}
                </div>
              </button>
              {open && filteredOptions && filteredOptions.length > 0 && (
                <div className="relative mb-[1px]">
                  <CommandList>
                    <div className="absolute top-0 z-10 w-full border rounded-md shadow-md outline-none bg-popover text-popover-foreground animate-in">
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
