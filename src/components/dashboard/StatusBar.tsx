import { cn } from '@/lib/utils';
import { type HealthStatus, getStatusSummary } from '@/lib/status';
import { EnvIndicator } from '@/components/navigation/EnvIndicator';

interface StatusBarProps {
  overallStatus: HealthStatus;
  uptime: string;
  healthyCount: number;
  servingCount: number;
  totalModules: number;
  criticalCount: number;
  warningCount: number;
  prometheusReady: boolean;
}

function StatusDot({
  status,
  size = 7,
}: {
  status: 'healthy' | 'warning' | 'critical' | 'unknown' | 'cyan';
  size?: number;
}) {
  const colorMap = {
    healthy: 'bg-status-healthy shadow-[0_0_6px_hsl(var(--status-healthy))]',
    warning: 'bg-status-warning shadow-[0_0_6px_hsl(var(--status-warning))]',
    critical: 'bg-status-critical shadow-[0_0_6px_hsl(var(--status-critical))]',
    unknown: 'bg-status-unknown',
    cyan: 'bg-primary shadow-[0_0_4px_hsl(var(--primary))]',
  };

  return (
    <span
      className={cn('inline-block shrink-0 rounded-full', colorMap[status])}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function StatusBar({
  overallStatus,
  uptime,
  healthyCount,
  servingCount,
  totalModules,
  criticalCount,
  warningCount,
  prometheusReady,
}: Readonly<StatusBarProps>) {
  const issueCount = criticalCount + warningCount;
  const summary = getStatusSummary(overallStatus, issueCount);

  const moduleFraction = prometheusReady
    ? `${healthyCount} / ${totalModules} healthy`
    : `${servingCount} / ${totalModules} serving`;

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-5">
      <div className="flex items-center gap-2.5 min-w-0">
        <StatusDot status={overallStatus} />
        <span className="text-[13px] text-muted-foreground truncate">
          {summary}
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <EnvIndicator />

        <span className="text-xs text-muted-foreground tabular-nums">
          {moduleFraction}
        </span>

        {prometheusReady && uptime !== 'Unknown' && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {uptime}
          </span>
        )}

        {prometheusReady && (
          <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <StatusDot status="cyan" size={5} />
            Metrics
          </span>
        )}
      </div>
    </div>
  );
}
