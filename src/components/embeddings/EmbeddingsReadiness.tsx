import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getNextReadinessAction,
  type ReadinessRow,
  type ReadinessState,
} from '@/lib/models/embeddings';

const STATE_LABEL: Record<ReadinessState, string> = {
  ready: 'Ready',
  waiting: 'Waiting',
  blocked: 'Blocked',
  unknown: 'Unknown',
};

const STATE_ICON: Record<ReadinessState, LucideIcon> = {
  ready: CheckCircle2,
  waiting: Clock,
  blocked: AlertTriangle,
  unknown: CircleHelp,
};

const STATE_ICON_CLASS: Record<ReadinessState, string> = {
  ready: 'text-status-healthy',
  waiting: 'text-status-warning',
  blocked: 'text-status-critical',
  unknown: 'text-status-unknown',
};

type EmbeddingsReadinessProps = {
  rows: ReadinessRow[];
  className?: string;
};

export function EmbeddingsReadiness({
  rows,
  className,
}: EmbeddingsReadinessProps) {
  const next = getNextReadinessAction(rows);

  return (
    <Card className={cn(className)}>
      <CardHeader className="gap-1">
        <CardTitle>Readiness</CardTitle>
        {next ? (
          <p className="text-sm text-muted-foreground text-pretty">
            Next: {next.detail}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Capabilities, provider, index, config, and workers are ready.
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ul>
          {rows.map((row, index) => {
            const Icon = STATE_ICON[row.state];
            return (
              <li
                key={row.id}
                className={cn(
                  'flex min-h-8 items-center gap-3 px-3 py-2',
                  index < rows.length - 1 && 'border-b border-border/60'
                )}
              >
                <Icon
                  aria-hidden
                  className={cn('size-4 shrink-0', STATE_ICON_CLASS[row.state])}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-5">
                    {row.label}
                  </p>
                  <p className="text-xs text-muted-foreground text-pretty">
                    {row.detail}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium',
                    STATE_ICON_CLASS[row.state]
                  )}
                >
                  {STATE_LABEL[row.state]}
                </span>
                {row.href && row.actionLabel ? (
                  <Link
                    href={row.href}
                    className="inline-flex min-h-8 shrink-0 items-center rounded-md px-2 text-[13px] font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {row.actionLabel}
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
