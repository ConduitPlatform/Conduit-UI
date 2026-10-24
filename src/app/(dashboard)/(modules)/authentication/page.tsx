import React from 'react';
import { Key, Plus, Settings, User, Users } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getAuthenticationMetrics,
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';
import { getPrometheusAvailability } from '@/lib/observability/prometheusAvailability';

export default async function AuthenticationDashboard() {
  const promAvailability = await getPrometheusAvailability();
  // Fetch metrics
  const metrics = await getAuthenticationMetrics();

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
    getApiModuleNameFromPath('/authentication') || 'authentication';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Authentication',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'User authentication and authorization management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Add User',
      description: 'Create a new user account',
      icon: <Plus className="h-4 w-4" />,
      href: '/authentication/users',
    },
    {
      title: 'Manage Users',
      description: 'View and manage existing users',
      icon: <Users className="h-4 w-4" />,
      href: '/authentication/users',
    },
    {
      title: 'Teams',
      description: 'Manage user teams and groups',
      icon: <Users className="h-4 w-4" />,
      href: '/authentication/teams',
    },
    {
      title: 'Strategies',
      description: 'Configure authentication strategies',
      icon: <Key className="h-4 w-4" />,
      href: '/authentication/strategies',
    },
    {
      title: 'Settings',
      description: 'Authentication module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/authentication/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Authentication"
        moduleIcon={<User className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
        prometheusState={promAvailability.state}
      />
    </div>
  );
}
