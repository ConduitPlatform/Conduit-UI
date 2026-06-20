'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MetricCard, MetricCardProps } from './MetricCard';
import { QuickActionsCard, QuickAction } from './QuickActionsCard';
import { ModuleStatusCard, ModuleStatus } from './ModuleStatusCard';
import { SystemMetricsCard } from './SystemMetricsCard';
import { FormattedMetric } from '@/lib/prometheus/metrics';
import { cn } from '@/lib/utils';
import { statusDotClassName } from '@/lib/status';
import type { ObservabilityServiceState } from '@/lib/observability/types';
import type { SharedRuntimeInfo } from '@/lib/utils/module-utils';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';

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
  prometheusState?: ObservabilityServiceState;
  sharedRuntime?: SharedRuntimeInfo;
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
  sharedRuntime,
}) => {
  return (
    <motion.div
      className={cn('space-y-6', className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {prometheusState && prometheusState !== 'ready' && (
        <Alert className="border-status-warning/30 bg-status-warning/5">
          <Info className="size-4" />
          <AlertDescription>
            {prometheusState === 'not_configured'
              ? 'Metrics are disabled for this environment. Set PROMETHEUS_URL to enable.'
              : 'Cannot reach Prometheus at the configured URL.'}
          </AlertDescription>
        </Alert>
      )}

      <motion.div className="flex items-center gap-3" variants={fadeUp}>
        <div className="flex items-center gap-2">
          {moduleIcon}
          <h1 className="text-lg font-semibold tracking-tight text-balance">
            {moduleName} Dashboard
          </h1>
        </div>
        <span
          className={statusDotClassName(moduleStatus.status, 'size-2.5')}
          title={moduleStatus.status}
        />
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
                  <span className="font-medium tabular-nums">
                    {moduleStatus.instances}
                  </span>
                </div>
              )}
              {sharedRuntime && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Runtime module:
                    </span>
                    <span className="font-medium">
                      {sharedRuntime.moduleName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-pretty">
                    {sharedRuntime.description}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-base font-semibold mb-3">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </motion.div>

      {systemMetrics && systemMetrics.length > 0 && (
        <motion.div variants={fadeUp}>
          <SystemMetricsCard
            metrics={systemMetrics}
            subtitle={sharedRuntime?.systemMetricsSubtitle}
          />
        </motion.div>
      )}

      {children && <motion.div variants={fadeUp}>{children}</motion.div>}
    </motion.div>
  );
};
