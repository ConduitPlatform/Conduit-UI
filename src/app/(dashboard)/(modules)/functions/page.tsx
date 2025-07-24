import React from 'react';
import { Code, Plus, Settings, Play, History, FileText } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getModuleMetrics,
  getModuleUptime,
  getModuleStatus,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function FunctionsDashboard() {
  // Fetch metrics
  const apiModuleName = getApiModuleNameFromPath('/functions') || 'functions';
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
    name: 'Functions',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Serverless function execution and management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Create Function',
      description: 'Create a new serverless function',
      icon: <Plus className="h-4 w-4" />,
      href: '/functions/create',
    },
    {
      title: 'View Functions',
      description: 'Browse and manage functions',
      icon: <Code className="h-4 w-4" />,
      href: '/functions/list',
    },
    {
      title: 'Execute Function',
      description: 'Test and execute functions',
      icon: <Play className="h-4 w-4" />,
      href: '/functions/execute',
    },
    {
      title: 'Execution History',
      description: 'View function execution logs',
      icon: <History className="h-4 w-4" />,
      href: '/functions/history',
    },
    {
      title: 'Settings',
      description: 'Functions module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/functions/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Functions"
        moduleIcon={<Code className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
