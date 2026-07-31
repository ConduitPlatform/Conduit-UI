'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { SendEmailForm } from '@/components/email/send/form';
import { TestSendSmsForm } from '@/components/sms/smsTest/testSendSmsForm';
import { TestSendForm } from '@/components/notifications/testSend/testSendForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getTemplates } from '@/lib/api/email';
import { formatEmailTemplatesApiError } from '@/lib/logic/api-error';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';

const TEST_TABS = ['email', 'sms', 'push'] as const;
type TestTab = (typeof TEST_TABS)[number];

function parseTestTab(tab: string | undefined): TestTab {
  if (tab === 'sms' || tab === 'push') return tab;
  return 'email';
}

type CommunicationsTestTabsProps = {
  initialTab: TestTab;
  token?: NotificationToken;
};

export function CommunicationsTestTabs({
  initialTab,
  token,
}: CommunicationsTestTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = initialTab;

  const [templates, setTemplates] = useState<Awaited<
    ReturnType<typeof getTemplates>
  > | null>(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplatesError(null);

      try {
        const data = await getTemplates({});
        if (!cancelled) {
          setTemplates(data);
        }
      } catch (err) {
        if (!cancelled) {
          setTemplates(null);
          setTemplatesError(formatEmailTemplatesApiError(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTemplates(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTabChange = (value: string) => {
    const tab = parseTestTab(value);
    const params = new URLSearchParams();
    params.set('tab', tab);

    const tokenId = searchParams.get('token');
    if (tab === 'push' && tokenId) {
      params.set('token', tokenId);
    }

    router.replace(`/communications/test?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
        <TabsTrigger value="push">Push</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="mt-6">
        {isLoadingTemplates && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        {!isLoadingTemplates && templatesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not load email templates</AlertTitle>
            <AlertDescription>{templatesError}</AlertDescription>
          </Alert>
        )}
        {!isLoadingTemplates && templates && (
          <SendEmailForm templates={templates} embedded />
        )}
      </TabsContent>

      <TabsContent value="sms" className="mt-6">
        <TestSendSmsForm embedded />
      </TabsContent>

      <TabsContent value="push" className="mt-6">
        <TestSendForm token={token} embedded />
      </TabsContent>
    </Tabs>
  );
}
