import React from 'react';
import { File, Folder, HardDrive, Plus, Settings, Upload } from 'lucide-react';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import {
  getModuleStatus,
  getModuleUptime,
  getStorageMetrics,
  getSystemMetrics,
} from '@/lib/prometheus/metrics';
import { getApiModuleNameFromPath } from '@/lib/utils/module-utils';
import { ModuleStatus } from '@/components/dashboard/ModuleStatusCard';
import { QuickAction } from '@/components/dashboard/QuickActionsCard';
import { MetricCardProps } from '@/components/dashboard/MetricCard';

export default async function StorageDashboard() {
  // Fetch metrics
  const metrics = await getStorageMetrics();

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
  const apiModuleName = getApiModuleNameFromPath('/storage') || 'storage';
  const uptime = await getModuleUptime(apiModuleName);

  // Get real module status - use correct API module name
  const status = await getModuleStatus(apiModuleName);

  // Module status
  const moduleStatus: ModuleStatus = {
    name: 'Storage',
    status: status,
    uptime: uptime,
    version: '1.0.0',
    instances: 1,
    description: 'File storage and management',
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: 'Upload File',
      description: 'Upload a new file to storage',
      icon: <Upload className="h-4 w-4" />,
      href: '/storage/upload',
    },
    {
      title: 'Browse Files',
      description: 'Browse and manage stored files',
      icon: <File className="h-4 w-4" />,
      href: '/storage/browse',
    },
    {
      title: 'Create Folder',
      description: 'Create a new storage folder',
      icon: <Plus className="h-4 w-4" />,
      href: '/storage/folders/create',
    },
    {
      title: 'Manage Folders',
      description: 'Organize storage folders',
      icon: <Folder className="h-4 w-4" />,
      href: '/storage/folders',
    },
    {
      title: 'Settings',
      description: 'Storage module configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/storage/settings',
    },
  ];

  return (
    <div className="p-6">
      <ModuleDashboard
        moduleName="Storage"
        moduleIcon={<HardDrive className="h-8 w-8" />}
        moduleStatus={moduleStatus}
        metrics={metricCards}
        systemMetrics={systemMetrics}
        quickActions={quickActions}
      />
    </div>
  );
}
