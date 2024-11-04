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
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
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

interface MultiOptionsFieldProps extends CommandProps {
  label: string;
  fieldName?: string;
  description?: string;
  placeholder?: string;
  options: Option[];
  className?: string;
  selectedOptions?: string[];
  setSelectedOptions: (newValue: (prev: string[]) => string[]) => void;
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
}: MultiOptionsFieldProps) => {

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>('');
  const DescriptionElement = fieldName ? FormDescription : 'span';
  const LabelElement = fieldName ? FormLabel : Label;
  const ItemWrapper = fieldName ? FormItem : 'div';
  const InputWrapper = fieldName ? FormControl : Fragment;

  const handleUnselect = useCallback((option: string) => {
    setSelectedOptions((prev: string[]) =>
      prev.filter(selected => selected !== option)
    );
  }, []);

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

  const handleSelect = (option: string) => {
    setInputValue('');
    setSelectedOptions && setSelectedOptions(prev => [...prev, option]);
  };

  const renderMultiSelectInput = (field?: ControllerRenderProps<any>) => (
    <ItemWrapper className={className}>
      <LabelElement className={labelClassName}>{label}</LabelElement>
      <InputWrapper>
        <Command className={'overflow-visible bg-transparent relative'}>
          <div
            className={cn(
              'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent pl-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5',
              selectTriggerClassName
            )}
            role="combobox"
            tabIndex={0}
            aria-controls="options"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            ref={containerRef}
          >
            <div className="flex flex-wrap gap-1">
              {selectedOptions &&
                selectedOptions.map(option => (
                  <Badge
                    key={option}
                    variant="secondary"
                    className={cn('flex gap-1', badgeClassName)}
                  >
                    {option}
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
                  onFocus={() => setOpen(false)}
                  placeholder={placeholder}
                  className={cn(
                    'flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
                    inputClassName
                  )}
                  {...restProps}
                />
              )}
            </div>
          </div>
          {selectedOptions && selectedOptions.length === 0 ? (
            <button
              className="absolute flex items-center justify-center transform -translate-x-1 -translate-y-1/2 rounded-md outline-none text-muted-foreground top-1/2 right-1"
              type="button"
              onClick={() => setOpen(!open)}
            >
              <ChevronDown className="flex-shrink-0 w-4 h-4" />
              <span className="sr-only">Open</span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedOptions && setSelectedOptions(() => [])}
              type="button"
              className="absolute flex items-center justify-center transform -translate-x-1 -translate-y-1/2 rounded-md outline-none hover:text-foreground text-muted-foreground top-1/2 right-1"
            >
              <X className="flex-shrink-0 w-4 h-4 " />
              <span className="sr-only">Clear</span>
            </button>
          )}
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
      </InputWrapper>
      {description && (
        <DescriptionElement className={descriptionClassName}>
          {description}
        </DescriptionElement>
      )}
      {field && <FormMessage className={errorClassName} />}
    </ItemWrapper>
  );

  if (fieldName) {
    const { control } = useFormContext();

    return (
      <FormField
        name={fieldName}
        control={control}
        render={({ field }) => renderMultiSelectInput(field)}
      />
    );
  }
  return renderMultiSelectInput();

};

export default MultiOptionsField;
