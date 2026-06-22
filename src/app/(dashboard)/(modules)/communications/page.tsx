import React from 'react';
import {
  FileText,
  History,
  MessagesSquare,
  Send,
  Settings,
} from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getEmailMetrics,
  getModuleStatus,
  getModuleUptime,
  getPushNotificationMetrics,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import {
  COMMUNICATIONS_SHARED_RUNTIME,
  getApiModuleNameFromPath,
} from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';

export default async function CommunicationsDashboard() {
  const promAvailability = await getPrometheusAvailability();
  const [emailMetrics, pushMetrics] = await Promise.all([
    getEmailMetrics(),
    getPushNotificationMetrics(),
  ]);
  const metrics = [...emailMetrics, ...pushMetrics];

  const metricCards: MetricCardProps[] = metrics.map(metric => ({
    title: metric.name,
    value: metric.value,
    description: metric.description,
    status: metric.status,
  }));

  const apiModuleName =
    getApiModuleNameFromPath('/communications') || 'communications';

  const systemMetrics = await getSystemMetrics(apiModuleName);
  const uptime = await getModuleUptime(apiModuleName);
  const status = await getModuleStatus(apiModuleName);

  const moduleStatus: ModuleStatus = {
    name: 'Communications',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Email, SMS, and push notifications',
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Templates',
      description: 'Manage email, SMS, and push templates',
      icon: <FileText className="h-4 w-4" />,
      href: '/communications/templates',
    },
    {
      title: 'Send a test',
      description: 'Send test messages across channels',
      icon: <Send className="h-4 w-4" />,
      href: '/communications/test',
    },
    {
      title: 'View logs',
      description: 'Email logs and push device tokens',
      icon: <History className="h-4 w-4" />,
      href: '/communications/logs',
    },
    {
      title: 'Channel settings',
      description: 'Configure email, SMS, and push providers',
      icon: <Settings className="h-4 w-4" />,
      href: '/communications/settings',
    },
  ];

  return (
    <ModuleDashboard
      moduleName="Communications"
      moduleIcon={<MessagesSquare className="h-8 w-8" />}
      moduleStatus={moduleStatus}
      metrics={metricCards}
      systemMetrics={systemMetrics}
      quickActions={quickActions}
      prometheusState={promAvailability.state}
      sharedRuntime={COMMUNICATIONS_SHARED_RUNTIME}
    />
  );
}
