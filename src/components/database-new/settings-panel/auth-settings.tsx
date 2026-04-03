'use client';

import * as React from 'react';
import { ResourceDefinition } from '@/lib/models/authorization';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

type AuthSettingsProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  authResource?: ResourceDefinition | null;
  schemaName: string;
  disabled?: boolean;
};

export function AuthSettings({
  enabled,
  onChange,
  authResource,
  schemaName,
  disabled,
}: AuthSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Authorization
        </CardTitle>
        <CardDescription>
          Enable fine-grained access control using the Authorization module
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            {enabled ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <Label
                htmlFor="auth-enabled"
                className="font-medium cursor-pointer"
              >
                Enable Authorization
              </Label>
              <p className="text-sm text-muted-foreground">
                {enabled
                  ? 'Authorization is active for this schema'
                  : 'Authorization is disabled'}
              </p>
            </div>
          </div>
          <Switch
            id="auth-enabled"
            checked={enabled}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        </div>

        {/* Authorization Resource Info */}
        {enabled && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-medium mb-2">Resource Definition</h4>
              {authResource ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Resource Name</span>
                    <Badge variant="secondary">{authResource.name}</Badge>
                  </div>
                  {authResource.relations && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Relations</span>
                      <span>
                        {Object.keys(authResource.relations || {}).length}
                      </span>
                    </div>
                  )}
                  {authResource.permissions && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Permissions</span>
                      <span>
                        {Object.keys(authResource.permissions || {}).length}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No resource definition found. One will be created when
                  authorization is enabled.
                </p>
              )}
            </div>

            <Link href={`/authorization/resources`}>
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Manage Authorization Resources
              </Button>
            </Link>
          </div>
        )}

        {!enabled && (
          <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/30 border">
            <p>
              When enabled, you can define fine-grained access control policies
              using the Authorization module. This allows you to control who can
              perform which operations on documents.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
