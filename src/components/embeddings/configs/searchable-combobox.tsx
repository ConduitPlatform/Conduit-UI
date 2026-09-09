'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type SearchableOption = {
  value: string;
  label: string;
};

type SearchableComboboxProps = {
  id?: string;
  value: string;
  options: SearchableOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  ariaLabel: string;
};

export function SearchableCombobox({
  id,
  value,
  options,
  onValueChange,
  disabled,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  ariaLabel,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'h-8 min-h-8 w-full justify-between px-3 text-left text-[13px] font-normal focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selected ? (
              selected.label
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,22rem)] p-0"
        align="start"
        onEscapeKeyDown={() => setOpen(false)}
      >
        <Command
          filter={(itemValue, search) => {
            if (!search.trim()) return 1;
            const query = search.trim().toLowerCase();
            return itemValue.toLowerCase().includes(query) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList className="max-h-[min(50vh,280px)] overflow-y-auto">
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  keywords={[option.label, option.value]}
                  className="min-h-8 focus-visible:ring-2 focus-visible:ring-ring"
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                  {value === option.value ? (
                    <Check className="ml-auto size-4 shrink-0" aria-hidden />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
