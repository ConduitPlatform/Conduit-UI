import { cn } from '@/lib/utils';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export function getStatusClasses(status: HealthStatus) {
  switch (status) {
    case 'healthy':
      return 'text-status-healthy bg-status-healthy/15';
    case 'warning':
      return 'text-status-warning bg-status-warning/15';
    case 'critical':
      return 'text-status-critical bg-status-critical/15';
    case 'unknown':
    default:
      return 'text-status-unknown bg-status-unknown/15';
  }
}

export function getStatusDotClasses(status: HealthStatus) {
  switch (status) {
    case 'healthy':
      return 'bg-status-healthy';
    case 'warning':
      return 'bg-status-warning';
    case 'critical':
      return 'bg-status-critical';
    case 'unknown':
    default:
      return 'bg-status-unknown';
  }
}

export function getStatusLabel(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'warning':
      return 'Warning';
    case 'critical':
      return 'Critical';
    case 'unknown':
    default:
      return 'Unknown';
  }
}

export function getStatusSummary(status: HealthStatus, issues: number): string {
  switch (status) {
    case 'healthy':
      return 'All systems operational';
    case 'warning':
      return `${issues} module${issues !== 1 ? 's' : ''} need${issues === 1 ? 's' : ''} attention`;
    case 'critical':
      return `${issues} critical issue${issues !== 1 ? 's' : ''} detected`;
    case 'unknown':
    default:
      return 'System status unavailable';
  }
}

export function statusDotClassName(
  status: HealthStatus,
  className?: string
): string {
  return cn(
    'inline-block size-2 shrink-0 rounded-full',
    getStatusDotClasses(status),
    className
  );
}
