import { cn } from '@/lib/utils';
import {
  Activity,
  Clock,
  AlertTriangle,
  Users,
  HardDrive,
  Database,
} from 'lucide-react';
import type { FormattedMetric } from '@/lib/prometheus/metrics';

interface BentoMetricsProps {
  metrics: FormattedMetric[];
}

const METRIC_CONFIG: Record<
  string,
  { icon: typeof Activity; primary?: boolean }
> = {
  'Total Requests': { icon: Activity, primary: true },
  'Avg Response Time': { icon: Clock },
  'Error Rate': { icon: AlertTriangle },
  'Active Users': { icon: Users },
  'Storage Usage': { icon: HardDrive },
  'DB Connections': { icon: Database },
};

export function BentoMetrics({ metrics }: Readonly<BentoMetricsProps>) {
  if (metrics.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-1 overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border">
        <Activity className="size-3.5 text-muted-foreground" />
        <span className="text-[13px] font-semibold">Platform Metrics</span>
      </div>
      <div className="flex flex-col gap-px">
        {metrics.map(metric => {
          const config = METRIC_CONFIG[metric.name];
          const Icon = config?.icon ?? Activity;
          const isPrimary = config?.primary;

          return (
            <div
              key={metric.name}
              className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors duration-100 hover:bg-surface-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="size-3.5 shrink-0 text-muted-foreground/50" />
                <span className="text-[13px] text-muted-foreground truncate">
                  {metric.name}
                </span>
              </div>
              <span
                className={cn(
                  'text-[15px] font-semibold tabular-nums tracking-[-0.01em]',
                  isPrimary
                    ? 'text-primary-muted-foreground'
                    : 'text-foreground'
                )}
              >
                {metric.value}
                {metric.unit && (
                  <span className="text-xs text-muted-foreground font-normal ml-0.5">
                    {metric.unit}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
