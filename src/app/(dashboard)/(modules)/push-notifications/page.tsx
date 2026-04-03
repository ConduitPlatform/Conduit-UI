import React from 'react';
import { Bell, Send, Settings, Users } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getModuleStatus,
  getModuleUptime,
  getPushNotificationMetrics,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';

export default async function PushNotificationsDashboard() {
  const promAvailability = await getPrometheusAvailability();
  // Fetch metrics
  const metrics = await getPushNotificationMetrics();

  // Convert to MetricCardProps format
  const metricCards: MetricCardProps[] = metrics.map(metric => ({
    title: metric.name,
    value: metric.value,
    description: metric.description,
    status: metric.status,
  }));

  // Get system metrics
  const systemMetrics = await getSystemMetrics();

  // Get real uptime data - use camelCase module name for API calls
  const apiModuleName =
    getApiModuleNameFromPath('/push-notifications') || 'pushNotifications';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use camelCase module name for API calls
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Push Notifications',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Push notification delivery and management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Send Notification',
      description: 'Test send to users or devices',
      icon: <Send className="h-4 w-4" />,
      href: '/push-notifications/test',
    },
    {
      title: 'Manage Tokens',
      description: 'View registered device tokens',
      icon: <Bell className="h-4 w-4" />,
      href: '/push-notifications/tokens',
    },
    {
      title: 'Platform users',
      description: 'Manage users for targeted notifications',
      icon: <Users className="h-4 w-4" />,
      href: '/authentication/users',
    },
    {
      title: 'Settings',
      description: 'Push notifications configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/push-notifications/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Push Notifications"
        moduleIcon={<Bell className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
        prometheusState={promAvailability.state}
      />
    </div>
  );
}
