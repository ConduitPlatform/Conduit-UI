import React from 'react';
import { MessageSquare, Plus, Send, Settings, Users } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getChatMetrics,
  getModuleStatus,
  getModuleUptime,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function ChatDashboard() {
  // Fetch metrics
  const metrics = await getChatMetrics();

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
  const apiModuleName = getApiModuleNameFromPath('/chat') || 'chat';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Chat',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Real-time chat and messaging',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Create Room',
      description: 'Create a new chat room',
      icon: <Plus className="h-4 w-4" />,
      href: '/chat/rooms/create',
    },
    {
      title: 'Chat Rooms',
      description: 'Manage chat rooms',
      icon: <MessageSquare className="h-4 w-4" />,
      href: '/chat/rooms',
    },
    {
      title: 'Send Message',
      description: 'Send a message to a room',
      icon: <Send className="h-4 w-4" />,
      href: '/chat/send',
    },
    {
      title: 'Manage Users',
      description: 'Manage chat participants',
      icon: <Users className="h-4 w-4" />,
      href: '/chat/users',
    },
    {
      title: 'Settings',
      description: 'Chat module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/chat/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Chat"
        moduleIcon={<MessageSquare className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
