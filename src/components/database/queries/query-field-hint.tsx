'use client';

import { Info } from 'lucide-react';
import TooltipHelper from '@/components/ui/helpers/TooltipHelper';

export function QueryFieldHint({ content }: { content: string }) {
  return (
    <TooltipHelper content={content}>
      <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
        <Info className="size-3.5" aria-hidden />
        <span className="sr-only">More information</span>
      </span>
    </TooltipHelper>
  );
}
