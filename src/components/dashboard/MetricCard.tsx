'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type HealthStatus, getStatusClasses } from '@/lib/status';

export interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: HealthStatus;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  trendValue,
  status = 'healthy',
  icon,
  className,
}) => {
  const getTrendIcon = (t?: string) => {
    switch (t) {
      case 'up':
        return <TrendingUp className="size-4 text-status-healthy" />;
      case 'down':
        return <TrendingDown className="size-4 text-status-critical" />;
      case 'stable':
        return <Minus className="size-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          {status && (
            <Badge
              variant="secondary"
              className={cn('text-[10px] capitalize', getStatusClasses(status))}
            >
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {(trend || trendValue) && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon(trend)}
            {trendValue && (
              <span className="text-xs text-muted-foreground">
                {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
