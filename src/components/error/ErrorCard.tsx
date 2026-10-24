'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

export function ErrorCard({
  title = 'Something went wrong',
  message,
  onRetry,
  actions,
}: Readonly<ErrorCardProps>) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {message ?? 'An unexpected error occurred. Please try again.'}
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              Try Again
            </Button>
          )}
          {actions}
        </CardFooter>
      </Card>
    </div>
  );
}
