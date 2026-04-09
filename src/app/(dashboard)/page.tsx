import {
  resolveModuleStates,
  getErrorRateChart,
  getPlatformMetrics,
  getPlatformUptime,
  getRequestVolumeChart,
  getResponseTimeChart,
  getSystemResourcesChart,
} from '@/lib/prometheus/metrics';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';
import { getModules } from '@/lib/api/modules';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { BentoMetrics } from '@/components/dashboard/BentoMetrics';
import { ActiveModuleGrid } from '@/components/dashboard/ActiveModuleGrid';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { CmdPaletteHint } from '@/components/dashboard/CmdPaletteHint';
import type { HealthStatus } from '@/lib/status';

const emptyChart = {
  timestamps: [] as number[],
  values: [] as number[],
  labels: [] as string[],
};

export default async function Home() {
  const [promAvailability, modules] = await Promise.all([
    getPrometheusAvailability(),
    getModules(),
  ]);
  const promReady = promAvailability.state === 'ready';

  const [resolvedStates, platformMetrics, uptime] = await Promise.all([
    resolveModuleStates(modules, promAvailability),
    getPlatformMetrics(),
    getPlatformUptime(),
  ]);

  const visible = resolvedStates.filter(s => s.deployed || s.vanished);
  const healthyCount = visible.filter(s => s.health === 'healthy').length;
  const warningCount = visible.filter(s => s.health === 'warning').length;
  const criticalCount = visible.filter(s => s.health === 'critical').length;
  const servingCount = visible.filter(s => s.serving).length;
  const issueCount = warningCount + criticalCount;

  let overallStatus: HealthStatus;
  if (criticalCount > 0) overallStatus = 'critical';
  else if (warningCount > 0) overallStatus = 'warning';
  else overallStatus = 'healthy';

  const [
    requestVolumeChart,
    responseTimeChart,
    errorRateChart,
    systemResourcesChart,
  ] = promReady
    ? await Promise.all([
        getRequestVolumeChart('1h'),
        getResponseTimeChart('1h'),
        getErrorRateChart('1h'),
        getSystemResourcesChart('1h'),
      ])
    : ([
        emptyChart,
        emptyChart,
        emptyChart,
        { cpu: emptyChart, memory: emptyChart },
      ] as const);

  return (
    <div className="flex flex-col h-full">
      <StatusBar
        overallStatus={overallStatus}
        uptime={uptime}
        healthyCount={healthyCount}
        servingCount={servingCount}
        totalModules={visible.length}
        criticalCount={criticalCount}
        warningCount={warningCount}
        prometheusReady={promReady}
      />

      <div className="px-5 pt-2.5 pb-0 shrink-0">
        <CmdPaletteHint />
      </div>

      <div className="flex-1 overflow-y-auto main-scrollbar px-5 pt-4 pb-8 space-y-4">
        <ActiveModuleGrid resolvedStates={resolvedStates} />

        <section className="grid gap-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BentoMetrics metrics={platformMetrics} />
          </div>

          {promReady && (
            <div className="lg:col-span-3">
              <PerformanceCharts
                initialData={{
                  requestVolume: requestVolumeChart,
                  responseTime: responseTimeChart,
                  errorRate: errorRateChart,
                  systemResources: systemResourcesChart,
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
