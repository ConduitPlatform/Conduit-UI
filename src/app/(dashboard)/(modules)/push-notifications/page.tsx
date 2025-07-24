import React from 'react';
import { Bell, Plus, Settings, Send, Users, History } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getPushNotificationMetrics,
  getModuleUptime,
  getModuleStatus,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function PushNotificationsDashboard() {
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
      description: 'Send a push notification',
      icon: <Send className="h-4 w-4" />,
      href: '/push-notifications/send',
    },
    {
      title: 'Manage Tokens',
      description: 'Manage device tokens',
      icon: <Bell className="h-4 w-4" />,
      href: '/push-notifications/tokens',
    },
    {
      title: 'User Management',
      description: 'Manage notification recipients',
      icon: <Users className="h-4 w-4" />,
      href: '/push-notifications/users',
    },
    {
      title: 'History',
      description: 'View notification history',
      icon: <History className="h-4 w-4" />,
      href: '/push-notifications/history',
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
      />
    </div>
  );
}
