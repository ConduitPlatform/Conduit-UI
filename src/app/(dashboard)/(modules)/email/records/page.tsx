'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailRecord } from '@/lib/models/email';
import { EmailFilters } from '@/components/email/records/email-filters';
import { EmailDetail } from '@/components/email/records/email-detail';
import { EmailList } from '@/components/email/records/email-list';
import { fetchRecords } from '@/lib/api/email';
import { PageHeader, PageTitle } from '@/components/ui/page-header';

export default function EmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Parse query params
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
  const limit = 10; // Fixed page size
  const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest

  // Fetch emails when query params change
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

    getEmails();
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

  // Update query params
  const updateQueryParams = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Update or remove params
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Reset skip when filters change
    if (!Object.keys(params).includes('skip')) {
      newParams.set('skip', '0');
    }

    router.push(`/email/records?${newParams.toString()}`);
  };

  const handleOpenDetail = (email: EmailRecord) => {
    setSelectedEmail(email);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader>
        <PageTitle>Email Management</PageTitle>
      </PageHeader>

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
        onViewEmail={handleOpenDetail}
      />

      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
