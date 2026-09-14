'use client';

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Play,
  type LucideIcon,
} from 'lucide-react';
import { BackfillRunState } from '@/lib/models/embeddings/backfill';
import {
  backfillStateClass,
  backfillStateLabel,
} from '@/lib/models/embeddings/backfill-view';
import { cn } from '@/lib/utils';

const STATE_ICON: Record<BackfillRunState, LucideIcon> = {
  queued: Clock,
  running: Play,
  completed: CheckCircle2,
  failed: AlertTriangle,
  canceled: Ban,
};

type BackfillStateBadgeProps = {
  state: BackfillRunState;
  className?: string;
};

export function BackfillStateBadge({
  state,
  className,
}: BackfillStateBadgeProps) {
  const Icon = STATE_ICON[state];
  const color = backfillStateClass(state);
  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 text-sm font-medium',
        color,
        className
      )}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      {backfillStateLabel(state)}
    </span>
  );
}
