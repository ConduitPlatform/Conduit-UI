'use client';

import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandProps,
} from '@/components/ui/command';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { Option } from '@/lib/models/logs-viewer';
import { Label } from '@/components/ui/label';

interface MultiSelectFieldProps extends CommandProps {
  label: string;
  fieldName?: string;
  description?: string;
  placeholder?: string;
  options: Option[];
  className?: string;
  selectedOptions?: string[];
  setSelectedOptions?: (newValue: (prev: string[]) => string[]) => void;
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

const MultiSelectField = ({
  fieldName,
  label,
  description,
  className,
  placeholder = 'Select options',
  options,
  selectedOptions,
  setSelectedOptions,
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
}: MultiSelectFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>('');

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [containerRef]);

  const filteredOptions = options?.filter(
    option => !selectedOptions?.some(selected => selected === option.value)
  );

  const classNames = {
    container:
      'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent pl-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5',
    removeButton:
      'flex items-center justify-center p-[3px] -mr-1 rounded-md outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2',
    removeIcon:
      'flex-shrink-0 w-3 h-3 text-muted-foreground hover:text-foreground',
    dropdownIconContainer:
      'absolute flex items-center justify-center transform -translate-x-1 -translate-y-1/2 rounded-md outline-none text-muted-foreground top-1/2 right-1',
    dropdownIcon: 'flex-shrink-0 w-4 h-4',
    clearButton:
      'absolute flex items-center justify-center transform -translate-x-1 -translate-y-1/2 rounded-md outline-none hover:text-foreground text-muted-foreground top-1/2 right-1',
    clearIcon: 'flex-shrink-0 w-4 h-4',
    commandListContainer:
      'absolute z-10 w-full border rounded-md shadow-md outline-none top-1 bg-background animate-in',
    commandEmpty: 'p-2 text-sm text-center text-muted-foreground',
    inputField:
      'flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
  };

  const MultiSelect = () => {
    const handleUnselect = useCallback((option: string) => {
      setSelectedOptions &&
        setSelectedOptions((prev: string[]) =>
          prev.filter(selected => selected !== option)
        );
    }, []);

    const handleSelect = (option: string) => {
      setInputValue('');
      setSelectedOptions && setSelectedOptions(prev => [...prev, option]);
    };

    return (
      <div className={className}>
        <Label className={labelClassName}>{label}</Label>
        <Command className="relative overflow-visible bg-transparent">
          <div
            className={cn(classNames.container, selectTriggerClassName)}
            role="combobox"
            tabIndex={0}
            aria-controls="options"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            ref={containerRef}
          >
            <div className="flex flex-wrap gap-1">
              {selectedOptions?.map(option => (
                <Badge
                  key={option}
                  variant="secondary"
                  className={cn('flex gap-1', badgeClassName)}
                >
                  {option}
                  <button
                    className={classNames.removeButton}
                    onKeyDown={e => e.key === 'Enter' && handleUnselect(option)}
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                    type="button"
                  >
                    <X className={classNames.removeIcon} />
                    <span className="sr-only">Remove</span>
                  </button>
                </Badge>
              ))}
              {filteredOptions?.length > 0 && (
                <Command.Input
                  ref={inputRef}
                  value={inputValue}
                  onValueChange={setInputValue}
                  onBlur={() => setOpen(false)}
                  onFocus={() => setOpen(false)}
                  placeholder={placeholder}
                  className={cn(classNames.inputField, inputClassName)}
                  {...restProps}
                />
              )}
            </div>
          </div>
          {selectedOptions?.length === 0 ? (
            <button
              className={classNames.dropdownIconContainer}
              type="button"
              onClick={() => setOpen(!open)}
            >
              <ChevronDown className={classNames.dropdownIcon} />
              <span className="sr-only">Open</span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedOptions && setSelectedOptions(() => [])}
              type="button"
              className={classNames.clearButton}
            >
              <X className={classNames.clearIcon} />
              <span className="sr-only">Clear</span>
            </button>
          )}
          {open && filteredOptions?.length > 0 && (
            <div className="relative">
              <CommandList>
                <div className={classNames.commandListContainer}>
                  <CommandEmpty>
                    <div className={classNames.commandEmpty}>
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
                        onSelect={() => handleSelect(option.value)}
                        className={cn('cursor-pointer', selectItemClassName)}
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
        {description && (
          <div className={descriptionClassName}>{description}</div>
        )}
      </div>
    );
  };

  const MultiSelectWithForm = () => {
    const { control, setValue } = useFormContext();

    useEffect(() => {
      if (selectedOptions) {
        setValue(fieldName!, selectedOptions);
      }
    }, [setValue]);

    const handleSelectWithForm = (option: string) => {
      setInputValue('');
      setValue(fieldName!, [...(selectedOptions || []), option]);
    };

    const handleUnselectWithForm = (option: string) => {
      setSelectedOptions &&
        setSelectedOptions((prev: string[]) =>
          prev.filter(selected => selected !== option)
        );
      setValue(
        fieldName!,
        selectedOptions?.filter(selected => selected !== option)
      );
    };

    return (
      <FormField
        name={fieldName!}
        control={control}
        render={({ field }) => (
          <FormItem className={className}>
            <FormLabel className={labelClassName}>{label}</FormLabel>
            <FormControl>
              <Command className="relative overflow-visible bg-transparent">
                <div
                  className={cn(classNames.container, selectTriggerClassName)}
                  role="combobox"
                  tabIndex={0}
                  aria-controls="options"
                  aria-expanded={open}
                  onClick={() => setOpen(!open)}
                  ref={containerRef}
                >
                  <div className="flex flex-wrap gap-1">
                    {field.value?.map((option: string) => (
                      <Badge
                        key={option}
                        variant="secondary"
                        className={cn('flex gap-1', badgeClassName)}
                      >
                        {option}
                        <button
                          className={classNames.removeButton}
                          onKeyDown={e =>
                            e.key === 'Enter' && handleUnselectWithForm(option)
                          }
                          onMouseDown={e => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => handleUnselectWithForm(option)}
                          type="button"
                        >
                          <X className={classNames.removeIcon} />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                    {filteredOptions?.length > 0 && (
                      <Command.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(false)}
                        placeholder={placeholder}
                        className={cn(classNames.inputField, inputClassName)}
                        {...restProps}
                      />
                    )}
                  </div>
                </div>
                {field.value?.length === 0 ? (
                  <button
                    className={classNames.dropdownIconContainer}
                    type="button"
                    onClick={() => setOpen(!open)}
                  >
                    <ChevronDown className={classNames.dropdownIcon} />
                    <span className="sr-only">Open</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setValue(fieldName!, [])}
                    type="button"
                    className={classNames.clearButton}
                  >
                    <X className={classNames.clearIcon} />
                    <span className="sr-only">Clear</span>
                  </button>
                )}
                {open && filteredOptions?.length > 0 && (
                  <div className="relative">
                    <CommandList>
                      <div className={classNames.commandListContainer}>
                        <CommandEmpty>
                          <div className={classNames.commandEmpty}>
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
                              onSelect={() =>
                                handleSelectWithForm(option.value)
                              }
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

  return fieldName ? <MultiSelectWithForm /> : <MultiSelect />;
};

export default MultiSelectField;
