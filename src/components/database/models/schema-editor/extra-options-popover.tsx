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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const fieldLabel = field.name.trim() || 'field';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
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
                aria-label={`Extra options for ${fieldLabel}`}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-pretty">
          <p>
            {disabled
              ? 'Extra options are unavailable for group fields.'
              : 'Add a description for this field.'}
          </p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Extra options</h4>

          <div className="space-y-2">
            <Label htmlFor={`description-${field.id}`} className="text-sm">
              Description
            </Label>
            <Textarea
              id={`description-${field.id}`}
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
