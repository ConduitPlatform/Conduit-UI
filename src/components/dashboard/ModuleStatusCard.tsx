'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModuleStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime?: string;
  lastSeen?: string;
  version?: string;
  instances?: number;
  description?: string;
}

export interface ModuleStatusCardProps {
  module: ModuleStatus;
  className?: string;
}

export const ModuleStatusCard: React.FC<ModuleStatusCardProps> = ({
  module,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'unknown':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'unknown':
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      case 'unknown':
        return 'Unknown';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{module.name}</CardTitle>
        <Badge variant="secondary" className={getStatusColor(module.status)}>
          {getStatusIcon(module.status)}
          <span className="ml-1">{getStatusText(module.status)}</span>
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {module.description && (
          <p className="text-sm text-muted-foreground">{module.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {module.uptime && (
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-medium">{module.uptime}</p>
            </div>
          )}

          {module.version && (
            <div>
              <p className="text-muted-foreground">Version</p>
              <p className="font-medium">{module.version}</p>
            </div>
          )}

          {module.instances !== undefined && (
            <div>
              <p className="text-muted-foreground">Instances</p>
              <p className="font-medium">{module.instances}</p>
            </div>
          )}

          {module.lastSeen && (
            <div>
              <p className="text-muted-foreground">Last Seen</p>
              <p className="font-medium">{module.lastSeen}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
