'use client';

import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SaveConfigButtonProps = {
  dirty: boolean;
  submitting: boolean;
  label: string;
  shortcutLabel: string;
};

export function SaveConfigButton({
  dirty,
  submitting,
  label,
  shortcutLabel,
}: SaveConfigButtonProps) {
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="submit"
            disabled={submitting || !dirty}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {submitting ? 'Saving…' : label}
            {!submitting && dirty ? (
              <kbd className="ml-1 rounded border bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px]">
                {shortcutLabel}
              </kbd>
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {dirty
              ? `Save configuration ${shortcutLabel}`
              : 'No unsaved changes'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
