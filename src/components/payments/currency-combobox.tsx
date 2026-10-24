'use client';

import * as React from 'react';
import { data } from 'currency-codes';
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
import { Check, ChevronDown } from 'lucide-react';

const options = data.map(row => ({
  code: row.code,
  name: row.currency,
}));

export type CurrencyComboboxProps = {
  value: string;
  onValueChange: (code: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
};

export function CurrencyCombobox({
  value,
  onValueChange,
  disabled,
  id,
  className,
  placeholder = 'Select currency…',
}: CurrencyComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const upper = value?.trim().toUpperCase() ?? '';
  const selected = options.find(o => o.code === upper);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal text-left h-9 px-3',
            className
          )}
          disabled={disabled}
        >
          <span className="truncate flex-1 min-w-0">
            {selected ? (
              <>
                <span className="font-medium tabular-nums">
                  {selected.code}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  — {selected.name}
                </span>
              </>
            ) : upper ? (
              <span className="tabular-nums font-medium">{upper}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            if (!search.trim()) return 1;
            const q = search.trim().toLowerCase();
            return itemValue.toLowerCase().includes(q) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search code or currency name…" />
          <CommandList className="max-h-[min(50vh,280px)] overflow-y-auto">
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem
                  key={opt.code}
                  value={`${opt.code} ${opt.name}`}
                  onSelect={() => {
                    onValueChange(opt.code);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="tabular-nums font-medium shrink-0">
                    {opt.code}
                  </span>
                  <span className="text-muted-foreground truncate text-sm">
                    {opt.name}
                  </span>
                  {upper === opt.code ? (
                    <Check className="ml-auto h-4 w-4 shrink-0" />
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
