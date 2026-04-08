import {
  getAllModuleStatuses,
  getErrorRateChart,
  getPlatformMetrics,
  getPlatformOverview,
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

  const [platformOverview, moduleStatuses, platformMetrics] = await Promise.all(
    [getPlatformOverview(), getAllModuleStatuses(), getPlatformMetrics()]
  );

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
      {/* Status strip — outside scrollable area */}
      <StatusBar
        overallStatus={platformOverview.overallStatus}
        uptime={platformOverview.uptime}
        activeModules={platformOverview.activeModules}
        totalModules={platformOverview.totalModules}
        criticalCount={platformOverview.criticalCount}
        warningCount={platformOverview.warningCount}
        prometheusReady={promReady}
      />

      {/* Command palette hint — outside scrollable area */}
      <div className="px-5 pt-2.5 pb-0 shrink-0">
        <CmdPaletteHint />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto main-scrollbar px-5 pt-4 pb-8 space-y-4">
        <ActiveModuleGrid modules={modules} moduleStatuses={moduleStatuses} />

        {/* Bottom split: metrics 2fr + chart 3fr */}
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
