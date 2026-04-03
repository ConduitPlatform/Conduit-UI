'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface ModuleHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: string;
  requests: string;
  icon: React.ReactNode;
  href: string;
}

export interface ModuleHealthGridProps {
  modules: ModuleHealth[];
  className?: string;
}

export const ModuleHealthGrid: React.FC<ModuleHealthGridProps> = ({
  modules,
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
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'critical':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('grid gap-3 md:grid-cols-2 lg:grid-cols-4', className)}>
      {modules.map((module, index) => (
        <Link key={index} href={module.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
              <div className="flex items-center space-x-2">
                <div className="text-muted-foreground">{module.icon}</div>
                <CardTitle className="text-sm font-medium">
                  {module.name}
                </CardTitle>
              </div>
              <Badge
                variant="secondary"
                className={getStatusColor(module.status)}
              >
                {getStatusIcon(module.status)}
                {module.status}
              </Badge>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{module.uptime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Requests:</span>
                  <span className="font-medium">{module.requests}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
