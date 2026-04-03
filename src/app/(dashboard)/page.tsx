import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  CloudIcon,
  CreditCard,
  Database,
  FunctionSquare,
  HardDrive,
  ListIcon,
  LucideMail,
  MessageSquare,
  Router,
  Server,
  Users,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PlatformMetrics } from '@/components/dashboard/PlatformMetrics';
import { ModuleHealthGrid } from '@/components/dashboard/ModuleHealthGrid';
import { SystemPerformanceCharts } from '@/components/dashboard/SystemPerformanceCharts';
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
import { PrometheusUnavailableBanner } from '@/components/dashboard/PrometheusUnavailableBanner';

const moduleIcons: Record<string, React.ReactNode> = {
  authentication: <Users className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  email: <LucideMail className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  functions: <FunctionSquare className="h-5 w-5" />,
  chat: <MessageSquare className="h-5 w-5" />,
  payments: <CreditCard className="h-5 w-5" />,
  router: <Router className="h-5 w-5" />,
  pushNotifications: <CloudIcon className="h-5 w-5" />,
  sms: <MessageSquare className="h-5 w-5" />,
};

const quickActions = [
  {
    title: 'Setup Authentication',
    description: 'Configure user authentication and authorization.',
    icon: <Users className="w-6 h-6" />,
    background: 'bg-pink-500',
    href: '/authentication/settings',
  },
  {
    title: 'Create Database Model',
    description: 'Design your data structure with models.',
    icon: <Database className="w-6 h-6" />,
    background: 'bg-yellow-500',
    href: '/database/models-new',
  },
  {
    title: 'Setup Storage',
    description: 'Configure file storage for your application.',
    icon: <HardDrive className="w-6 h-6" />,
    background: 'bg-green-500',
    href: '/storage/settings',
  },
  {
    title: 'Configure Email',
    description: 'Set up email sending capabilities.',
    icon: <LucideMail className="w-6 h-6" />,
    background: 'bg-blue-500',
    href: '/email/settings',
  },
  {
    title: 'Add Server Function',
    description: 'Create custom server-side functions.',
    icon: <FunctionSquare className="w-6 h-6" />,
    background: 'bg-indigo-500',
    href: '/functions/functions/new',
  },
  {
    title: 'Create Custom Query',
    description: 'Build custom database queries.',
    icon: <ListIcon className="w-6 h-6" />,
    background: 'bg-purple-500',
    href: '/database/queries/new',
  },
];

const emptyMetricChart = {
  timestamps: [] as number[],
  values: [] as number[],
  labels: [] as string[],
};

export default async function Home() {
  const promAvailability = await getPrometheusAvailability();
  const promReady = promAvailability.state === 'ready';

  const [platformMetrics, moduleStatuses, platformOverview] = await Promise.all(
    [getPlatformMetrics(), getAllModuleStatuses(), getPlatformOverview()]
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
    : [
        emptyMetricChart,
        emptyMetricChart,
        emptyMetricChart,
        { cpu: emptyMetricChart, memory: emptyMetricChart },
      ];

  const moduleStatusesWithIcons = moduleStatuses.map(module => ({
    ...module,
    icon: moduleIcons[module.iconName] || (
      <div className="w-5 h-5 bg-gray-300 rounded" />
    ),
  }));

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-48px)] overflow-y-auto">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Server className="h-6 w-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold">Conduit Platform</h1>
                  <p className="text-sm text-muted-foreground">
                    Platform Performance Dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {platformOverview.uptime}
                </div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {platformOverview.activeModules}/
                  {platformOverview.totalModules}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active Modules
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {platformOverview.platformVersion}
                </div>
                <div className="text-xs text-muted-foreground">
                  Platform Version
                </div>
              </div>
              <Badge
                className={cn(
                  platformOverview.overallStatus === 'healthy' &&
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400',
                  platformOverview.overallStatus === 'warning' &&
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400',
                  platformOverview.overallStatus === 'critical' &&
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                )}
              >
                {platformOverview.overallStatus === 'healthy' && (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {platformOverview.overallStatus === 'warning' && (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {platformOverview.overallStatus === 'critical' && (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {platformOverview.overallStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Platform Performance</h2>
        {promAvailability.state !== 'ready' && (
          <PrometheusUnavailableBanner state={promAvailability.state} />
        )}
        <PlatformMetrics metrics={platformMetrics} />
      </div>

      {/* Module Health Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Module Health</h2>
        <ModuleHealthGrid modules={moduleStatusesWithIcons} />
      </div>

      {/* System Performance Charts */}
      <div>
        <SystemPerformanceCharts
          prometheusState={promAvailability.state}
          initialData={{
            requestVolume: requestVolumeChart,
            responseTime: responseTimeChart,
            errorRate: errorRateChart,
            systemResources: systemResourcesChart,
          }}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Get started with common tasks and configurations
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((item, itemIdx) => (
            <Link key={itemIdx} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        item.background,
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white'
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex mt-6">
          <Link
            href="https://getconduit.dev/docs/overview/intro"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            target="_blank"
          >
            View full documentation
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
