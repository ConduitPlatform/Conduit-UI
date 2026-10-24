'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FileJson, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type RelationPickerProps = {
  value?: string;
  onChange: (model: string) => void;
  availableModels: string[];
  disabled?: boolean;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function RelationPicker({
  value,
  onChange,
  availableModels,
  disabled,
  placeholder = 'Select model...',
  open,
  onOpenChange,
}: RelationPickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    setInternalOpen(newOpen);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <FileJson className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-3 text-center text-sm">
                <p>No models found.</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Create a model first to add relations.
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {availableModels.map(model => (
                <CommandItem
                  key={model}
                  value={model}
                  onSelect={() => {
                    onChange(model);
                    handleOpenChange(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <FileJson className="w-4 h-4 text-muted-foreground" />
                    <span>{model}</span>
                  </div>
                  {value === model && <Check className="w-4 h-4 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
