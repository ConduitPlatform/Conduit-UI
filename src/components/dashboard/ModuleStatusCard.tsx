'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  type HealthStatus,
  getStatusClasses,
  getStatusLabel,
  statusDotClassName,
} from '@/lib/status';

export interface ModuleStatus {
  name: string;
  status: HealthStatus;
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
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{module.name}</CardTitle>
        <Badge
          variant="secondary"
          className={cn('capitalize', getStatusClasses(module.status))}
        >
          <span
            className={statusDotClassName(module.status, 'size-1.5 mr-1.5')}
          />
          {getStatusLabel(module.status)}
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
              <p className="font-medium tabular-nums">{module.instances}</p>
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
