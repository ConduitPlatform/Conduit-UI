import React from 'react';
import { BarChart3, Network, Route, Settings, Shield } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getModuleStatus,
  getModuleUptime,
  getRouterMetrics,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function RouterDashboard() {
  // Fetch metrics
  const metrics = await getRouterMetrics();

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
  const apiModuleName = getApiModuleNameFromPath('/router') || 'router';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Router',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Request routing and security management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Route Visualization',
      description: 'Interactive graph view of routes',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/router/vizualize',
    },
    {
      title: 'Security',
      description: 'Manage security clients and policies',
      icon: <Shield className="h-4 w-4" />,
      href: '/router/security',
    },
    {
      title: 'Network',
      description: 'View network configuration',
      icon: <Network className="h-4 w-4" />,
      href: '/router/network',
    },
    {
      title: 'Settings',
      description: 'Router module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/router/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Router"
        moduleIcon={<Route className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      ></ModuleDashboard>
    </div>
  );
}
