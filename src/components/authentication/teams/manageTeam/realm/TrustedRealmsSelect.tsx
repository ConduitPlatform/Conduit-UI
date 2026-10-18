'use client';
import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

export type RealmOption = {
  /** Realm team id (the value stored in `allowedHomeRealms`). */
  id: string;
  slug: string;
  name: string;
};

/** Multi-select of realm teams. An empty selection means "any home realm". */
export function TrustedRealmsSelect({
  value,
  onChange,
  options,
  loading,
  disabled,
}: Readonly<{
  value: string[];
  onChange: (value: string[]) => void;
  options: RealmOption[];
  loading?: boolean;
  disabled?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const labelFor = (id: string) =>
    options.find(option => option.id === id)?.slug ?? id;
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={value.length === 0 ? 'text-muted-foreground' : ''}>
              {value.length === 0
                ? 'Any home realm'
                : `${value.length} selected`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search realms..." />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Loading realms...' : 'No other realms found.'}
              </CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    key={option.id}
                    value={`${option.slug} ${option.name}`}
                    onSelect={() => toggle(option.id)}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-mono text-xs">
                        {option.slug}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {option.name}
                      </span>
                    </div>
                    {value.includes(option.id) && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map(id => (
            <Badge key={id} variant="secondary" className="gap-1 font-mono">
              {labelFor(id)}
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${labelFor(id)}`}
                  onClick={() => toggle(id)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
