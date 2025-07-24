'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { FormattedMetric } from '@/lib/prometheus/metrics';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Database,
  Network,
} from 'lucide-react';

interface SystemMetricsCardProps {
  metrics: FormattedMetric[];
}

const getMetricIcon = (metricName: string) => {
  const name = metricName.toLowerCase();
  if (name.includes('cpu')) return <Cpu className="h-4 w-4" />;
  if (name.includes('memory') || name.includes('heap'))
    return <HardDrive className="h-4 w-4" />;
  if (name.includes('event loop')) return <Clock className="h-4 w-4" />;
  if (name.includes('active requests')) return <Activity className="h-4 w-4" />;
  if (name.includes('active handles')) return <Network className="h-4 w-4" />;
  if (name.includes('active resources'))
    return <Database className="h-4 w-4" />;
  return <HardDrive className="h-4 w-4" />;
};

export function SystemMetricsCard({ metrics }: SystemMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
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
              <div className="flex-shrink-0">{getMetricIcon(metric.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {metric.name}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.description}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full ${
                    metric.status === 'healthy'
                      ? 'bg-green-500'
                      : metric.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
