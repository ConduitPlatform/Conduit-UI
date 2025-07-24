import React from 'react';
import {
  MessageSquare,
  Plus,
  Settings,
  Send,
  History,
  Users,
} from 'lucide-react';
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

export default async function SmsDashboard() {
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
      description: 'Send a new SMS message',
      icon: <Send className="h-4 w-4" />,
      href: '/sms/send',
    },
    {
      title: 'Message History',
      description: 'View SMS sending history',
      icon: <History className="h-4 w-4" />,
      href: '/sms/history',
    },
    {
      title: 'Manage Contacts',
      description: 'Manage SMS recipients',
      icon: <Users className="h-4 w-4" />,
      href: '/sms/contacts',
    },
    {
      title: 'Test SMS',
      description: 'Test SMS functionality',
      icon: <MessageSquare className="h-4 w-4" />,
      href: '/sms/test',
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
      />
    </div>
  );
}
