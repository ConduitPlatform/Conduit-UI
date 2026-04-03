import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { ObservabilityServiceState } from '@/lib/observability/types';

type BannerState = Exclude<ObservabilityServiceState, 'ready'>;

export function PrometheusUnavailableBanner({ state }: { state: BannerState }) {
  if (state === 'not_configured') {
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Metrics are disabled for this environment. Set{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            PROMETHEUS_URL
          </code>{' '}
          to enable charts and module metrics (for example{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            http://localhost:9090
          </code>{' '}
          for local Prometheus).
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
      <Info className="h-4 w-4" />
      <AlertDescription>
        Cannot reach Prometheus at the configured URL. Check that the service is
        running, the URL is correct, and any required authentication (basic or
        Azure) is valid.
      </AlertDescription>
    </Alert>
  );
}
