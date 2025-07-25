'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  Users,
  AlertTriangle,
  HardDrive,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlatformMetric {
  name: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'healthy' | 'warning' | 'critical';
  description?: string;
}

export interface PlatformMetricsProps {
  metrics: PlatformMetric[];
  className?: string;
}

export const PlatformMetrics: React.FC<PlatformMetricsProps> = ({
  metrics,
  className,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName.toLowerCase()) {
      case 'total requests':
        return <Activity className="h-4 w-4" />;
      case 'avg response time':
        return <Clock className="h-4 w-4" />;
      case 'active users':
        return <Users className="h-4 w-4" />;
      case 'error rate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'storage usage':
        return <HardDrive className="h-4 w-4" />;
      case 'db connections':
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={cn(
        'grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        className
      )}
    >
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-muted-foreground">
                {getMetricIcon(metric.name)}
              </div>
              {metric.status && (
                <Badge
                  variant="secondary"
                  className={getStatusColor(metric.status)}
                >
                  {metric.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{metric.value}</div>
            {metric.unit && (
              <p className="text-xs text-muted-foreground">{metric.unit}</p>
            )}
            {(metric.trend || metric.trendValue) && (
              <div className="flex items-center space-x-1 mt-1">
                {getTrendIcon(metric.trend)}
                {metric.trendValue && (
                  <span className="text-xs text-muted-foreground">
                    {metric.trendValue}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
