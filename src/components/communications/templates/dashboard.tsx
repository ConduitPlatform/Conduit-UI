'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Info } from 'lucide-react';
import { CommunicationTemplatesTable } from './data-table';
import { SearchInput } from '@/components/helpers/search';
import { CreateCommunicationTemplateSheet } from './create-template-sheet';
import { BulkAddChannelsButton } from './bulk-add-channels-button';
import { AddChannelsDialog } from './add-channels-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';
import { getCommunicationTemplates } from '@/lib/api/communications/templates';
import {
  getExternalTemplates,
  getTemplates,
  syncTemplates,
} from '@/lib/api/email';
import {
  formatCommunicationsApiError,
  formatEmailTemplatesApiError,
} from '@/lib/logic/api-error';
import { RefreshCw } from 'lucide-react';
import { isNil } from 'lodash';
import { mergeTemplateRows } from '@/lib/logic/merge-template-rows';
import {
  ChannelFilter,
  filterTemplateRows,
  rowMatchesChannel,
  TemplateFilter,
} from '@/lib/models/communications/template-row';
import { CommunicationTemplate } from '@/lib/models/communications/templates';
import { EmailTemplate, ExternalTemplate } from '@/lib/models/email';

const TEMPLATE_LIST_LIMIT = 500;

type CommunicationTemplatesResponse = {
  templateDocuments: CommunicationTemplate[];
  count: number;
};

type EmailTemplatesResponse = {
  templateDocuments: EmailTemplate[];
  count: number;
};

type ExternalTemplatesResponse = {
  templateDocuments: ExternalTemplate[];
  count: number;
};

const EMPTY_UNIFIED: CommunicationTemplatesResponse = {
  templateDocuments: [],
  count: 0,
};

const EMPTY_EMAIL: EmailTemplatesResponse = {
  templateDocuments: [],
  count: 0,
};

export function CommunicationTemplatesDashboard({
  emailTemplateId,
}: {
  emailTemplateId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [communicationTemplates, setCommunicationTemplates] =
    useState<CommunicationTemplatesResponse>(EMPTY_UNIFIED);
  const [emailTemplates, setEmailTemplates] =
    useState<EmailTemplatesResponse>(EMPTY_EMAIL);
  const [externalTemplates, setExternalTemplates] =
    useState<ExternalTemplatesResponse | null>(null);
  const [unifiedApiAvailable, setUnifiedApiAvailable] = useState(true);
  const [emailTemplatesError, setEmailTemplatesError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const [sourceFilter, setSourceFilter] = useState<TemplateFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [addChannelsDialogId, setAddChannelsDialogId] = useState<string | null>(
    null
  );
  const [addChannelsDialogOpen, setAddChannelsDialogOpen] = useState(false);

  const pageIndex = Number.parseInt(searchParams.get('pageIndex') ?? '0', 10);
  const sort = searchParams.get('sort') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setEmailTemplatesError(null);

    const fetchArgs = {
      skip: Number.isNaN(pageIndex) ? 0 : pageIndex * 10,
      limit: TEMPLATE_LIST_LIMIT,
      sort,
      search,
    };

    const [unifiedResult, emailResult, externalResult] = await Promise.all([
      getCommunicationTemplates(fetchArgs).catch(err => ({ err })),
      getTemplates(fetchArgs).catch(err => ({ err })),
      getExternalTemplates({
        limit: TEMPLATE_LIST_LIMIT,
        sortByName: true,
      }).catch(() => null),
    ]);

    if ('err' in unifiedResult) {
      setUnifiedApiAvailable(false);
      setCommunicationTemplates(EMPTY_UNIFIED);
    } else {
      setUnifiedApiAvailable(true);
      setCommunicationTemplates(unifiedResult);
    }

    if ('err' in emailResult) {
      setEmailTemplates(EMPTY_EMAIL);
      setEmailTemplatesError(formatEmailTemplatesApiError(emailResult.err));
    } else {
      setEmailTemplates(emailResult);
      setEmailTemplatesError(null);
    }

    setExternalTemplates(externalResult);
    setIsLoading(false);
  }, [pageIndex, search, sort]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const mergedRows = useMemo(
    () =>
      mergeTemplateRows(
        communicationTemplates.templateDocuments,
        emailTemplates.templateDocuments,
        externalTemplates?.templateDocuments ?? null
      ),
    [
      communicationTemplates.templateDocuments,
      emailTemplates.templateDocuments,
      externalTemplates?.templateDocuments,
    ]
  );

  const emailTemplateCount = useMemo(
    () => mergedRows.filter(row => row.kind === 'email').length,
    [mergedRows]
  );

  const filteredRows = useMemo(() => {
    const bySource = filterTemplateRows(mergedRows, sourceFilter);
    return bySource.filter(row => rowMatchesChannel(row, channelFilter));
  }, [mergedRows, sourceFilter, channelFilter]);

  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();
  const displayedRows = useMemo(() => {
    if (!searchTerm) return filteredRows;
    return filteredRows.filter(row =>
      row.template.name.toLowerCase().includes(searchTerm)
    );
  }, [filteredRows, searchTerm]);

  const openAddChannelsDialog = useCallback((templateId: string) => {
    setAddChannelsDialogId(templateId);
    setAddChannelsDialogOpen(true);
  }, []);

  const handleAddChannelsDialogOpenChange = useCallback(
    (open: boolean) => {
      setAddChannelsDialogOpen(open);
      if (!open) {
        setAddChannelsDialogId(null);
        if (searchParams.get('email')) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete('email');
          const query = params.toString();
          router.replace(query ? `${pathname}?${query}` : pathname);
        }
      }
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (emailTemplateId) {
      openAddChannelsDialog(emailTemplateId);
    }
  }, [emailTemplateId, openAddChannelsDialog]);

  const handleSyncExternal = () => {
    syncTemplates()
      .then(() => {
        toast({
          title: 'Communications',
          description: 'External templates synced successfully',
        });
        void loadTemplates();
      })
      .catch(err =>
        toast({
          title: 'Communications',
          description: formatCommunicationsApiError(err),
        })
      );
  };

  if (!isLoading && emailTemplatesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Could not load email templates</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{emailTemplatesError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadTemplates}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {!unifiedApiAvailable && (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertTitle>Unified templates unavailable</AlertTitle>
          <AlertDescription>
            Multi-channel unified templates require a Conduit build with
            CommunicationTemplate CRUD. Email and external templates are still
            available below.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={sourceFilter}
          onValueChange={value => setSourceFilter(value as TemplateFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unified">Unified</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={channelFilter}
          onValueChange={value => setChannelFilter(value as ChannelFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All channels</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="push">Push</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput />
        {unifiedApiAvailable && (
          <BulkAddChannelsButton emailTemplateCount={emailTemplateCount} />
        )}
        {!isNil(externalTemplates) && (
          <Button
            variant="secondary"
            type="button"
            onClick={handleSyncExternal}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync external
          </Button>
        )}
        {unifiedApiAvailable && <CreateCommunicationTemplateSheet />}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <CommunicationTemplatesTable
          rows={displayedRows}
          onAddChannels={
            unifiedApiAvailable ? openAddChannelsDialog : undefined
          }
        />
      )}

      {sourceFilter === 'external' &&
        isNil(externalTemplates) &&
        !isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            External templates are not available for this email provider.
          </p>
        )}

      <AddChannelsDialog
        emailTemplateId={addChannelsDialogId}
        open={addChannelsDialogOpen}
        onOpenChange={handleAddChannelsDialogOpenChange}
      />
    </div>
  );
}
