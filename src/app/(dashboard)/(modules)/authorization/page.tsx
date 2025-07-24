import React from 'react';
import { Shield, Plus, Settings, Users, Key, Lock } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getAuthorizationMetrics,
  getModuleUptime,
  getModuleStatus,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function AuthorizationDashboard() {
  // Fetch metrics
  const metrics = await getAuthorizationMetrics();

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
  const apiModuleName =
    getApiModuleNameFromPath('/authorization') || 'authorization';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Authorization',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Access control and permission management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Resources',
      description: 'Manage authorization resources',
      icon: <Shield className="h-4 w-4" />,
      href: '/authorization/resources',
    },
    {
      title: 'Relations',
      description: 'Manage authorization relations',
      icon: <Key className="h-4 w-4" />,
      href: '/authorization/relations',
    },
    {
      title: 'Permissions',
      description: 'Manage permissions and policies',
      icon: <Lock className="h-4 w-4" />,
      href: '/authorization/permissions',
    },
    {
      title: 'Users',
      description: 'Manage user permissions',
      icon: <Users className="h-4 w-4" />,
      href: '/authorization/users',
    },
    {
      title: 'Settings',
      description: 'Authorization module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/authorization/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Authorization"
        moduleIcon={<Shield className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
