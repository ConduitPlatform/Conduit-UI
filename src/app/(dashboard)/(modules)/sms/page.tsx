import React from 'react';
import { MessageSquare, Send, Settings } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getModuleMetrics,
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';

export default async function SmsDashboard() {
  const promAvailability = await getPrometheusAvailability();
  // Fetch metrics
  const apiModuleName = getApiModuleNameFromPath('/sms') || 'sms';
  const metrics = await getModuleMetrics(apiModuleName);

  // Convert to MetricCardProps format
  const metricCards: MetricCardProps[] = metrics.map(metric => ({
    title: metric.name,
    value: metric.value,
    description: metric.description,
    status: metric.status,
  }));

  // Get system metrics
  const systemMetrics = await getSystemMetrics();

  // Get real uptime data - use correct API module name
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'SMS',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'SMS messaging and delivery management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Send SMS',
      description: 'Send a test SMS message',
      icon: <Send className="h-4 w-4" />,
      href: '/sms/send',
    },
    {
      title: 'SMS settings',
      description: 'Provider and module configuration',
      icon: <MessageSquare className="h-4 w-4" />,
      href: '/sms/settings',
    },
    {
      title: 'Settings',
      description: 'SMS module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/sms/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="SMS"
        moduleIcon={<MessageSquare className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
        prometheusState={promAvailability.state}
      />
    </div>
  );
}
