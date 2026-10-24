'use client';

import { AlertTriangle, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ModuleNotFoundProps {
  moduleName: string;
  isAvailable: boolean;
  isServing: boolean;
}

export function ModuleNotFound({
  moduleName,
  isAvailable,
  isServing,
}: ModuleNotFoundProps) {
  const getTitle = () => {
    if (!isAvailable) {
      return `${moduleName} Module Not Deployed`;
    }
    if (!isServing) {
      return `${moduleName} Module Not Available`;
    }
    return `${moduleName} Module Not Found`;
  };

  const getDescription = () => {
    if (!isAvailable) {
      return `The ${moduleName} module is not currently deployed in your system. This module needs to be installed and configured on the backend before it can be accessed through the UI.`;
    }
    if (!isServing) {
      return `The ${moduleName} module is deployed but not currently serving. Please check the module configuration and ensure it's properly set up.`;
    }
    return `The ${moduleName} module could not be found. Please check your configuration.`;
  };

  const getActionText = () => {
    if (!isAvailable) {
      return 'Return to Home';
    }
    if (!isServing) {
      return 'Go to Settings';
    }
    return 'Return to Home';
  };

  const getActionLink = () => {
    if (!isAvailable) {
      return '/';
    }
    if (!isServing) {
      return `/${moduleName.toLowerCase()}/settings`;
    }
    return '/';
  };

  const getActionIcon = () => {
    if (!isAvailable) {
      return Home;
    }
    if (!isServing) {
      return Settings;
    }
    return Home;
  };

  const ActionIcon = getActionIcon();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-callout-warning-muted">
            <AlertTriangle className="h-6 w-6 text-callout-warning-foreground" />
          </div>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild className="w-full">
            <Link href={getActionLink()}>
              <ActionIcon className="mr-2 h-4 w-4" />
              {getActionText()}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
