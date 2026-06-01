'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField } from './fields-table';

type ExtraOptionsPopoverProps = {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  disabled?: boolean;
};

export function ExtraOptionsPopover({
  field,
  onUpdate,
  disabled,
}: ExtraOptionsPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const hasOptions = !!field.description;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8',
            hasOptions && 'text-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Extra options</h4>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe this field..."
              value={field.description || ''}
              onChange={e => onUpdate({ description: e.target.value })}
              rows={2}
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
