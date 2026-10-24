'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Eye, Pencil, Trash2, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

type CrudOperation = {
  enabled: boolean;
  authenticated: boolean;
};

type CrudOperations = {
  create: CrudOperation;
  read: CrudOperation;
  update: CrudOperation;
  delete: CrudOperation;
};

type CrudPermissionsProps = {
  crudOperations: CrudOperations;
  onChange: (operations: CrudOperations) => void;
  disabled?: boolean;
};

const operationConfig = [
  {
    key: 'create' as const,
    label: 'Create',
    description: 'Allow creating new documents',
    icon: Plus,
    color: 'text-status-healthy',
  },
  {
    key: 'read' as const,
    label: 'Read',
    description: 'Allow reading documents',
    icon: Eye,
    color: 'text-status-info',
  },
  {
    key: 'update' as const,
    label: 'Update',
    description: 'Allow updating existing documents',
    icon: Pencil,
    color: 'text-status-warning',
  },
  {
    key: 'delete' as const,
    label: 'Delete',
    description: 'Allow deleting documents',
    icon: Trash2,
    color: 'text-status-critical',
  },
];

export function CrudPermissions({
  crudOperations,
  onChange,
  disabled,
}: CrudPermissionsProps) {
  const handleToggleEnabled = (key: keyof CrudOperations) => {
    onChange({
      ...crudOperations,
      [key]: {
        ...crudOperations[key],
        enabled: !crudOperations[key].enabled,
      },
    });
  };

  const handleToggleAuthenticated = (key: keyof CrudOperations) => {
    onChange({
      ...crudOperations,
      [key]: {
        ...crudOperations[key],
        authenticated: !crudOperations[key].authenticated,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">CRUD Permissions</CardTitle>
        <CardDescription>
          Configure which operations are allowed on this schema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {operationConfig.map(op => {
            const operation = crudOperations[op.key];
            const Icon = op.icon;

            return (
              <div
                key={op.key}
                className={cn(
                  'p-4 rounded-lg border transition-colors',
                  operation.enabled
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-muted bg-muted/30',
                  disabled && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-md',
                        operation.enabled
                          ? `${op.color} bg-background`
                          : 'text-muted-foreground bg-muted'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{op.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {op.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={operation.enabled}
                    onCheckedChange={() => handleToggleEnabled(op.key)}
                    disabled={disabled}
                  />
                </div>

                {operation.enabled && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {operation.authenticated ? (
                        <Lock className="h-4 w-4 text-status-warning" />
                      ) : (
                        <Unlock className="h-4 w-4 text-status-healthy" />
                      )}
                      <Label
                        htmlFor={`${op.key}-auth`}
                        className="text-sm cursor-pointer"
                      >
                        Require Authentication
                      </Label>
                    </div>
                    <Switch
                      id={`${op.key}-auth`}
                      checked={operation.authenticated}
                      onCheckedChange={() => handleToggleAuthenticated(op.key)}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
