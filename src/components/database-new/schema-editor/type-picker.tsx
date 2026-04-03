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
  CommandSeparator,
} from '@/components/ui/command';
import {
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  Link2,
  FileJson,
  Boxes,
  List,
  Database,
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'ObjectId'
  | 'JSON'
  | 'Relation'
  | 'Enum'
  | 'Group';

type TypePickerProps = {
  value: FieldType;
  onChange: (type: FieldType) => void;
  disabled?: boolean;
};

type TypeOption = {
  value: FieldType;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const commonTypes: TypeOption[] = [
  {
    value: 'String',
    label: 'String',
    description: 'Variable-length text',
    icon: <Type className="w-4 h-4" />,
  },
  {
    value: 'Number',
    label: 'Number',
    description: 'Numeric value (integer or decimal)',
    icon: <Hash className="w-4 h-4" />,
  },
  {
    value: 'Boolean',
    label: 'Boolean',
    description: 'True or false value',
    icon: <ToggleLeft className="w-4 h-4" />,
  },
  {
    value: 'Date',
    label: 'Date',
    description: 'Date and time value',
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    value: 'ObjectId',
    label: 'ObjectId',
    description: 'Unique identifier',
    icon: <Database className="w-4 h-4" />,
  },
];

const advancedTypes: TypeOption[] = [
  {
    value: 'Relation',
    label: 'Relation',
    description: 'Reference to another model',
    icon: <Link2 className="w-4 h-4" />,
  },
  {
    value: 'Enum',
    label: 'Enum',
    description: 'Predefined set of values',
    icon: <List className="w-4 h-4" />,
  },
  {
    value: 'JSON',
    label: 'JSON',
    description: 'Arbitrary JSON data',
    icon: <FileJson className="w-4 h-4" />,
  },
  {
    value: 'Group',
    label: 'Group (Nested)',
    description: 'Nested object structure',
    icon: <Boxes className="w-4 h-4" />,
  },
];

const allTypes = [...commonTypes, ...advancedTypes];

const typeColors: Record<FieldType, string> = {
  String: 'text-blue-600',
  Number: 'text-purple-600',
  Boolean: 'text-green-600',
  Date: 'text-orange-600',
  Relation: 'text-pink-600',
  ObjectId: 'text-gray-600',
  JSON: 'text-yellow-600',
  Group: 'text-teal-600',
  Enum: 'text-indigo-600',
};

export function TypePicker({ value, onChange, disabled }: TypePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedType = allTypes.find(t => t.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-8 w-full justify-between font-normal',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className={cn(typeColors[value])}>{selectedType?.icon}</span>
            <span>{selectedType?.label || value}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search types..." />
          <CommandList>
            <CommandEmpty>No type found.</CommandEmpty>
            <CommandGroup heading="Common">
              {commonTypes.map(type => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={() => {
                    onChange(type.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={cn(typeColors[type.value])}>
                      {type.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </div>
                  {value === type.value && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Advanced">
              {advancedTypes.map(type => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={() => {
                    onChange(type.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={cn(typeColors[type.value])}>
                      {type.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </div>
                  {value === type.value && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
