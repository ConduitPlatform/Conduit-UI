'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost';
  external?: boolean;
}

export interface QuickActionsCardProps {
  title?: string;
  actions: QuickAction[];
  className?: string;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  title = 'Quick Actions',
  actions,
  className,
}) => {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-muted-foreground">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {action.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
            {action.external ? (
              <Button variant={action.variant || 'outline'} size="sm" asChild>
                <a href={action.href} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              </Button>
            ) : (
              <Button variant={action.variant || 'outline'} size="sm" asChild>
                <Link href={action.href}>Go</Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
