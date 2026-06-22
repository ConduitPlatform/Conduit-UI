'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmailSettings } from '@/lib/models/email';
import { SmsSettings } from '@/lib/models/Sms';
import { NotificationSettings } from '@/lib/models/Notification';

type Channel = 'email' | 'sms' | 'push';

type ChannelStatusCardProps = {
  channel: Channel;
  emailSettings?: EmailSettings;
  smsSettings?: SmsSettings;
  pushSettings?: NotificationSettings;
};

function formatProviderName(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

function getChannelStatus(
  channel: Channel,
  emailSettings?: EmailSettings,
  smsSettings?: SmsSettings,
  pushSettings?: NotificationSettings
) {
  switch (channel) {
    case 'email':
      return {
        label: 'Email',
        active: emailSettings?.active ?? false,
        provider: emailSettings?.transport
          ? formatProviderName(emailSettings.transport)
          : 'Not configured',
      };
    case 'sms':
      return {
        label: 'SMS',
        active: smsSettings?.active ?? false,
        provider: smsSettings?.providerName
          ? formatProviderName(smsSettings.providerName)
          : 'Not configured',
      };
    case 'push':
      return {
        label: 'Push',
        active: pushSettings?.active ?? false,
        provider: pushSettings?.providerName
          ? formatProviderName(pushSettings.providerName)
          : 'Not configured',
      };
    default: {
      const _exhaustive: never = channel;
      return _exhaustive;
    }
  }
}

export function ChannelStatusCard({
  channel,
  emailSettings,
  smsSettings,
  pushSettings,
}: ChannelStatusCardProps) {
  const status = getChannelStatus(
    channel,
    emailSettings,
    smsSettings,
    pushSettings
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{status.label} status</CardTitle>
        <CardDescription>Current provider configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Module</span>
          <Badge variant={status.active ? 'default' : 'secondary'}>
            {status.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Provider</span>
          <p className="text-sm font-medium">{status.provider}</p>
        </div>
        {!status.active && (
          <p className="text-xs text-muted-foreground">
            Enable and configure this channel before sending tests.
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/communications/settings?tab=${channel}`}>
            Channel settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
