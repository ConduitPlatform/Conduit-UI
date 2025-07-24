import React from 'react';
import { FileText, History, Mail, Plus, Send, Settings } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getEmailMetrics,
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function EmailDashboard() {
  // Fetch metrics
  const metrics = await getEmailMetrics();

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
  const apiModuleName = getApiModuleNameFromPath('/email') || 'email';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Email',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Email sending and template management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Send Email',
      description: 'Send a new email message',
      icon: <Send className="h-4 w-4" />,
      href: '/email/send',
    },
    {
      title: 'Create Template',
      description: 'Create a new email template',
      icon: <Plus className="h-4 w-4" />,
      href: '/email/templates/create',
    },
    {
      title: 'Templates',
      description: 'Manage email templates',
      icon: <FileText className="h-4 w-4" />,
      href: '/email/templates',
    },
    {
      title: 'Records',
      description: 'View email sending history',
      icon: <History className="h-4 w-4" />,
      href: '/email/records',
    },
    {
      title: 'Settings',
      description: 'Email module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/email/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Email"
        moduleIcon={<Mail className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
