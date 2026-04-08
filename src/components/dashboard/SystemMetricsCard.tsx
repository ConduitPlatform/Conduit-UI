'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedMetric } from '@/lib/prometheus/metrics';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Database,
  Network,
} from 'lucide-react';
import { type HealthStatus, statusDotClassName } from '@/lib/status';

interface SystemMetricsCardProps {
  metrics: FormattedMetric[];
}

const getMetricIcon = (metricName: string) => {
  const name = metricName.toLowerCase();
  if (name.includes('cpu')) return <Cpu className="size-4" />;
  if (name.includes('memory') || name.includes('heap'))
    return <HardDrive className="size-4" />;
  if (name.includes('event loop')) return <Clock className="size-4" />;
  if (name.includes('active requests')) return <Activity className="size-4" />;
  if (name.includes('active handles')) return <Network className="size-4" />;
  if (name.includes('active resources')) return <Database className="size-4" />;
  return <HardDrive className="size-4" />;
};

export function SystemMetricsCard({ metrics }: SystemMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          System Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="shrink-0 text-muted-foreground">
                {getMetricIcon(metric.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {metric.name}
                </div>
                <div className="text-lg font-semibold tabular-nums text-foreground">
                  {metric.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.description}
                </div>
              </div>
              <span
                className={statusDotClassName(
                  (metric.status ?? 'unknown') as HealthStatus,
                  'size-2.5'
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
