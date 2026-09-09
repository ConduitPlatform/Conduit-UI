import {
  AlertTriangle,
  Info,
  Plus,
  ScanSearch,
  Search,
  Settings,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { EmbeddingsReadiness } from '@/components/embeddings/EmbeddingsReadiness';
import {
  getBackfills,
  getEmbeddingConfigs,
  getEmbeddingsCapabilities,
  getEmbeddingsSettings,
  getEmbeddingsStatus,
} from '@/lib/api/embeddings';
import { resolveIndexesBySchema } from '@/lib/api/embeddings/indexes';
import {
  deriveEmbeddingsReadiness,
  EmbeddingsQueueCounts,
  EmbeddingsStatus,
  formatEmbeddingsApiError,
} from '@/lib/models/embeddings';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';
import {
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';

function settledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

function settledError(
  result: PromiseSettledResult<unknown>
): string | undefined {
  if (result.status !== 'rejected') return undefined;
  return formatEmbeddingsApiError(result.reason);
}

function emptyQueue(): EmbeddingsQueueCounts {
  return {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    paused: 0,
  };
}

function addQueues(
  left: EmbeddingsQueueCounts,
  right: EmbeddingsQueueCounts
): EmbeddingsQueueCounts {
  return {
    waiting: left.waiting + right.waiting,
    active: left.active + right.active,
    completed: left.completed + right.completed,
    failed: left.failed + right.failed,
    delayed: left.delayed + right.delayed,
    paused: left.paused + right.paused,
  };
}

function metricValue(
  value: number | undefined,
  unavailable: boolean
): { value: string; status: MetricCardProps['status'] } {
  if (unavailable) {
    return { value: '—', status: 'unknown' };
  }
  return {
    value: (value ?? 0).toLocaleString(),
    status: 'healthy',
  };
}

export default async function EmbeddingsDashboard() {
  const apiModuleName = getApiModuleNameFromPath('/embeddings') || 'embeddings';

  const [
    statusResult,
    capabilitiesResult,
    configsResult,
    settingsResult,
    backfillsResult,
    promAvailabilityResult,
    moduleHealthResult,
    uptimeResult,
    systemMetricsResult,
  ] = await Promise.allSettled([
    getEmbeddingsStatus(),
    getEmbeddingsCapabilities(),
    getEmbeddingConfigs(),
    getEmbeddingsSettings(),
    getBackfills({ skip: 0, limit: 1 }),
    getPrometheusAvailability(),
    getModuleStatus(apiModuleName),
    getModuleUptime(apiModuleName),
    getSystemMetrics(apiModuleName),
  ]);

  const status = settledValue(statusResult);
  const capabilities =
    settledValue(capabilitiesResult)?.capabilities ?? status?.capabilities;
  const configs = settledValue(configsResult);
  const settings = settledValue(settingsResult)?.config;
  const backfills = settledValue(backfillsResult);
  const promAvailability = settledValue(promAvailabilityResult);

  const indexesBySchema = configs
    ? await resolveIndexesBySchema(configs.map(config => config.schemaName))
    : undefined;

  const workersEnabled = status?.enabled ?? settings?.enabled;
  const rows = deriveEmbeddingsReadiness({
    capabilities,
    capabilitiesError: settledError(capabilitiesResult),
    settings,
    settingsError: settledError(settingsResult),
    configs,
    configsError: settledError(configsResult),
    indexesBySchema,
    workersEnabled,
  });

  const queueUnavailable = !status;
  const queues = status
    ? addQueues(status.generationQueue, status.backfillQueue)
    : emptyQueue();

  const metricCards: MetricCardProps[] = [
    {
      title: 'Queue waiting',
      ...metricValue(queues.waiting, queueUnavailable),
      description: 'Generation and backfill jobs waiting',
      status: queueUnavailable
        ? 'unknown'
        : queues.waiting > 0
          ? 'warning'
          : 'healthy',
    },
    {
      title: 'Queue active',
      ...metricValue(queues.active, queueUnavailable),
      description: 'Jobs currently processing',
    },
    {
      title: 'Queue failed',
      ...metricValue(queues.failed, queueUnavailable),
      description: 'Failed generation and backfill jobs',
      status: queueUnavailable
        ? 'unknown'
        : queues.failed > 0
          ? 'critical'
          : 'healthy',
    },
    {
      title: 'Configs',
      ...metricValue(configs?.length, configs == null),
      description:
        backfills == null
          ? 'Embedding configurations'
          : `${backfills.count.toLocaleString()} backfill runs`,
    },
  ];

  const moduleStatus: ModuleStatus = {
    name: 'Embeddings',
    status: settledValue(moduleHealthResult) ?? 'unknown',
    uptime: settledValue(uptimeResult) ?? 'Unknown',
    version: '1.0.0',
    instances: 1,
    description: 'Vector embeddings, indexes, and semantic search',
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Configure provider',
      description: 'Set endpoint, API key, and worker toggle',
      icon: <Settings className="h-4 w-4" />,
      href: '/embeddings/settings',
    },
    {
      title: 'New config',
      description: 'Create a schema embedding configuration',
      icon: <Plus className="h-4 w-4" />,
      href: '/embeddings/configs/new',
    },
    {
      title: 'Test search',
      description: 'Run operator semantic search',
      icon: <Search className="h-4 w-4" />,
      href: '/embeddings/test',
    },
  ];

  const warnings = collectWarnings({
    status,
    capabilitiesError: settledError(capabilitiesResult),
    statusError: settledError(statusResult),
    configsError: settledError(configsResult),
    settingsError: settledError(settingsResult),
    backfillsError: settledError(backfillsResult),
    workersEnabled,
    capabilitiesSupported: capabilities?.supported,
    capabilitiesReason: capabilities?.reason,
  });

  return (
    <ModuleDashboard
      moduleName="Embeddings"
      moduleIcon={<ScanSearch className="h-8 w-8" />}
      moduleStatus={moduleStatus}
      metrics={metricCards}
      systemMetrics={settledValue(systemMetricsResult)}
      quickActions={quickActions}
      prometheusState={promAvailability?.state}
      showModuleInformation={false}
      prometheusPlacement="after"
      leadWithChildren
    >
      <div className="space-y-4">
        {warnings.length > 0 ? (
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <Alert
                key={`${warning.title}-${index}`}
                variant={warning.variant}
              >
                {warning.variant === 'destructive' ? (
                  <AlertTriangle className="size-4" />
                ) : (
                  <Info className="size-4" />
                )}
                <AlertTitle>{warning.title}</AlertTitle>
                <AlertDescription>{warning.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        ) : null}
        <EmbeddingsReadiness rows={rows} />
      </div>
    </ModuleDashboard>
  );
}

type OverviewWarning = {
  title: string;
  description: string;
  variant: 'warning' | 'destructive';
};

function collectWarnings(args: {
  status?: EmbeddingsStatus;
  capabilitiesError?: string;
  statusError?: string;
  configsError?: string;
  settingsError?: string;
  backfillsError?: string;
  workersEnabled?: boolean;
  capabilitiesSupported?: boolean;
  capabilitiesReason?: string;
}): OverviewWarning[] {
  const warnings: OverviewWarning[] = [];

  if (args.capabilitiesSupported === false) {
    warnings.push({
      title: 'Vector capabilities unavailable',
      description:
        args.capabilitiesReason ??
        'This database does not support vector storage and search.',
      variant: 'destructive',
    });
  } else if (args.capabilitiesError) {
    warnings.push({
      title: 'Could not load capabilities',
      description: args.capabilitiesError,
      variant: 'warning',
    });
  }

  if (args.workersEnabled === false) {
    warnings.push({
      title: 'Workers disabled',
      description:
        'Overview stays available. Enable workers in Settings to process jobs.',
      variant: 'warning',
    });
  }

  if (args.statusError) {
    warnings.push({
      title: 'Status unavailable',
      description: args.statusError,
      variant: 'warning',
    });
  }

  if (args.settingsError) {
    warnings.push({
      title: 'Settings unavailable',
      description: args.settingsError,
      variant: 'warning',
    });
  }

  if (args.configsError) {
    warnings.push({
      title: 'Configs unavailable',
      description: args.configsError,
      variant: 'warning',
    });
  }

  if (args.backfillsError) {
    warnings.push({
      title: 'Backfill count unavailable',
      description: args.backfillsError,
      variant: 'warning',
    });
  }

  for (const message of args.status?.warnings ?? []) {
    warnings.push({
      title: 'Embeddings warning',
      description: message,
      variant: 'warning',
    });
  }

  return warnings;
}
