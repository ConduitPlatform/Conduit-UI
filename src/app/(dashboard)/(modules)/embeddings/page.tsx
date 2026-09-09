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
import {
  getDeclaredSchemas,
  resolveIndexesBySchema,
} from '@/lib/api/embeddings/indexes';
import {
  addEmbeddingsQueues,
  collectOverviewWarnings,
  deriveEmbeddingsReadiness,
  emptyEmbeddingsQueue,
  settledError,
  settledValue,
  workersEnabledFromStatus,
} from '@/lib/models/embeddings';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';
import {
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';

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
    schemasResult,
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
    getDeclaredSchemas(),
  ]);

  const status = settledValue(statusResult);
  const capabilities =
    settledValue(capabilitiesResult)?.capabilities ?? status?.capabilities;
  const configs = settledValue(configsResult);
  const settings = settledValue(settingsResult)?.config;
  const backfills = settledValue(backfillsResult);
  const promAvailability = settledValue(promAvailabilityResult);

  const indexesBySchema = configs
    ? await resolveIndexesBySchema(
        configs.map(config => config.schemaName),
        settledValue(schemasResult)
      )
    : undefined;

  const workersEnabled = workersEnabledFromStatus({
    status,
    settingsEnabled: settings?.enabled,
  });
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
    ? addEmbeddingsQueues(status.generationQueue, status.backfillQueue)
    : emptyEmbeddingsQueue();

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
      description: 'Set endpoint, API key, and models',
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

  const warnings = collectOverviewWarnings({
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
