'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailRecord } from '@/lib/models/email';
import { EmailFilters } from '@/components/email/records/email-filters';
import { EmailDetail } from '@/components/email/records/email-detail';
import { EmailList } from '@/components/email/records/email-list';
import { fetchRecords } from '@/lib/api/email';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTokensTable from '@/components/notifications/tokens/tokens';
import { NotificationToken } from '@/lib/models/notification/NotificationToken';

const LOGS_TABS = ['email', 'push'] as const;
type LogsTab = (typeof LOGS_TABS)[number];

function parseLogsTab(tab: string | undefined): LogsTab {
  return tab === 'push' ? 'push' : 'email';
}

type PushTokensData = {
  tokens: NotificationToken[];
  count: number;
};

type CommunicationsLogsTabsProps = {
  initialTab: LogsTab;
  pushTokensData?: PushTokensData;
  refreshPushTokens: (search: string) => Promise<NotificationToken[]>;
};

function EmailLogsPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const messageId = searchParams.get('messageId') || undefined;
  const templateId = searchParams.get('templateId') || undefined;
  const receiver = searchParams.get('receiver') || undefined;
  const sender = searchParams.get('sender') || undefined;
  const cc = searchParams.get('cc')
    ? searchParams.get('cc')?.split(',')
    : undefined;
  const replyTo = searchParams.get('replyTo') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const skip = Number.parseInt(searchParams.get('skip') || '0');
  const limit = 10;
  const sort = searchParams.get('sort') || '-createdAt';

  useEffect(() => {
    const getEmails = async () => {
      setLoading(true);
      try {
        const { records, count } = await fetchRecords({
          messageId,
          templateId,
          receiver,
          sender,
          cc,
          replyTo,
          startDate,
          endDate,
          skip,
          limit,
          sort,
        });
        setEmails(records);
        setTotalCount(count);
      } catch (error) {
        console.error('Failed to fetch emails:', error);
      } finally {
        setLoading(false);
      }
    };

    void getEmails();
  }, [
    messageId,
    templateId,
    receiver,
    sender,
    cc,
    replyTo,
    startDate,
    endDate,
    skip,
    limit,
    sort,
  ]);

  const updateQueryParams = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', 'email');

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      if (!Object.keys(params).includes('skip')) {
        newParams.set('skip', '0');
      }

      router.replace(`/communications/logs?${newParams.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      <EmailFilters
        initialFilters={{
          messageId,
          templateId,
          receiver,
          sender,
          cc: cc?.join(','),
          replyTo,
          startDate,
          endDate,
        }}
        onFilterChange={updateQueryParams}
      />

      <EmailList
        emails={emails}
        loading={loading}
        totalCount={totalCount}
        currentPage={Math.floor(skip / limit) + 1}
        pageSize={limit}
        onPageChange={page =>
          updateQueryParams({ skip: ((page - 1) * limit).toString() })
        }
        onSortChange={sortField => updateQueryParams({ sort: sortField })}
        currentSort={sort}
        onViewEmail={email => {
          setSelectedEmail(email);
          setIsDetailOpen(true);
        }}
      />

      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
}

export function CommunicationsLogsTabs({
  initialTab,
  pushTokensData,
  refreshPushTokens,
}: CommunicationsLogsTabsProps) {
  const router = useRouter();
  const activeTab = initialTab;

  const handleTabChange = (value: string) => {
    const tab = parseLogsTab(value);
    router.replace(`/communications/logs?tab=${tab}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="email">Email Logs</TabsTrigger>
        <TabsTrigger value="push">Push Devices</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="mt-6">
        <EmailLogsPanel />
      </TabsContent>

      <TabsContent value="push" className="mt-6">
        {pushTokensData ? (
          <NotificationTokensTable
            data={pushTokensData.tokens}
            count={pushTokensData.count}
            refreshData={refreshPushTokens}
          />
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
