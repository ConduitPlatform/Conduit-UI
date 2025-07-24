import React from 'react';
import {
  CreditCard,
  Plus,
  Settings,
  Users,
  DollarSign,
  History,
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

export default async function PaymentsDashboard() {
  // Fetch metrics
  const apiModuleName = getApiModuleNameFromPath('/payments') || 'payments';
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
    name: 'Payments',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'Payment processing and billing management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Customers',
      description: 'Manage payment customers',
      icon: <Users className="h-4 w-4" />,
      href: '/payments/customers',
    },
    {
      title: 'Products',
      description: 'Manage payment products',
      icon: <CreditCard className="h-4 w-4" />,
      href: '/payments/products',
    },
    {
      title: 'Transactions',
      description: 'View payment transactions',
      icon: <DollarSign className="h-4 w-4" />,
      href: '/payments/transactions',
    },
    {
      title: 'Subscriptions',
      description: 'Manage payment subscriptions',
      icon: <History className="h-4 w-4" />,
      href: '/payments/subscriptions',
    },
    {
      title: 'Settings',
      description: 'Payments module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/payments/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Payments"
        moduleIcon={<CreditCard className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
