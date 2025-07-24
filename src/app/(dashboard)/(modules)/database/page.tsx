import React from 'react';
import { Database, FileText, Plus, Search, Settings } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getDatabaseMetrics,
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function DatabaseDashboard() {
  // Fetch metrics
  const metrics = await getDatabaseMetrics();

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
  const apiModuleName = getApiModuleNameFromPath('/database') || 'database';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Database',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Database management and query execution',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Create Model',
      description: 'Create a new database model',
      icon: <Plus className="h-4 w-4" />,
      href: '/database/models/create',
    },
    {
      title: 'View Models',
      description: 'Browse and manage database models',
      icon: <FileText className="h-4 w-4" />,
      href: '/database/models',
    },
    {
      title: 'Custom Queries',
      description: 'Create and manage custom queries',
      icon: <Search className="h-4 w-4" />,
      href: '/database/queries',
    },
    {
      title: 'Introspection',
      description: 'Introspect existing database schemas',
      icon: <Search className="h-4 w-4" />,
      href: '/database/introspection',
    },
    {
      title: 'Settings',
      description: 'Database module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/database/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Database"
        moduleIcon={<Database className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
