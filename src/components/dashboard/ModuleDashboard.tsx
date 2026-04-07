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
import { motion } from 'motion/react';

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

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
    <motion.div
      className={cn('space-y-6', className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {prometheusState && prometheusState !== 'ready' && (
        <PrometheusUnavailableBanner state={prometheusState} />
      )}
      <motion.div className="flex items-center space-x-4" variants={fadeUp}>
        <div className="flex items-center space-x-2">
          {moduleIcon}
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {moduleName} Dashboard
          </h1>
        </div>
      </motion.div>

      <motion.div className="grid gap-4 md:grid-cols-3" variants={fadeUp}>
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
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </motion.div>

      {systemMetrics && systemMetrics.length > 0 && (
        <motion.div variants={fadeUp}>
          <SystemMetricsCard metrics={systemMetrics} />
        </motion.div>
      )}

      {children && <motion.div variants={fadeUp}>{children}</motion.div>}
    </motion.div>
  );
};
