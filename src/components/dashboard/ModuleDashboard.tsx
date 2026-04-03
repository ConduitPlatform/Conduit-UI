'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard, MetricCardProps } from './MetricCard';
import { QuickActionsCard, QuickAction } from './QuickActionsCard';
import { ModuleStatusCard, ModuleStatus } from './ModuleStatusCard';
import { SystemMetricsCard } from './SystemMetricsCard';
import { FormattedMetric } from '@/lib/prometheus/metrics';
import { cn } from '@/lib/utils';
import { PrometheusUnavailableBanner } from '@/components/dashboard/PrometheusUnavailableBanner';
import type { ObservabilityServiceState } from '@/lib/observability/types';

export interface ModuleDashboardProps {
  moduleName: string;
  moduleIcon: React.ReactNode;
  moduleStatus: ModuleStatus;
  metrics: MetricCardProps[];
  systemMetrics?: FormattedMetric[];
  quickActions: QuickAction[];
  children?: React.ReactNode;
  className?: string;
  /** When set and not `ready`, shows a banner above metrics. */
  prometheusState?: ObservabilityServiceState;
}

export const ModuleDashboard: React.FC<ModuleDashboardProps> = ({
  moduleName,
  moduleIcon,
  moduleStatus,
  metrics,
  systemMetrics,
  quickActions,
  children,
  className,
  prometheusState,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {prometheusState && prometheusState !== 'ready' && (
        <PrometheusUnavailableBanner state={prometheusState} />
      )}
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {moduleIcon}
          <h1 className="text-3xl font-bold tracking-tight">
            {moduleName} Dashboard
          </h1>
        </div>
      </div>

      {/* Top Row: Status, Quick Actions, Module Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <ModuleStatusCard module={moduleStatus} />
        <QuickActionsCard actions={quickActions} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Module Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Module:</span>
                <span className="font-medium">{moduleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">
                  {moduleStatus.status}
                </span>
              </div>
              {moduleStatus.version && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{moduleStatus.version}</span>
                </div>
              )}
              {moduleStatus.instances !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instances:</span>
                  <span className="font-medium">{moduleStatus.instances}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Row */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* System Metrics Row */}
      {systemMetrics && systemMetrics.length > 0 && (
        <div>
          <SystemMetricsCard metrics={systemMetrics} />
        </div>
      )}

      {/* Additional Content */}
      {children && <div>{children}</div>}
    </div>
  );
};
