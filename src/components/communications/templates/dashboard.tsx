'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CommunicationTemplatesTable } from './data-table';
import { SearchInput } from '@/components/helpers/search';
import { CreateCommunicationTemplateSheet } from './create-template-sheet';
import { BulkAddChannelsButton } from './bulk-add-channels-button';
import { AddChannelsDialog } from './add-channels-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { syncTemplates } from '@/lib/api/email';
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

export function CommunicationTemplatesDashboard({
  communicationTemplates,
  emailTemplates,
  externalTemplates,
  emailTemplateId,
}: {
  communicationTemplates: CommunicationTemplatesResponse;
  emailTemplates: EmailTemplatesResponse;
  externalTemplates: ExternalTemplatesResponse | null;
  emailTemplateId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [sourceFilter, setSourceFilter] = useState<TemplateFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [addChannelsDialogId, setAddChannelsDialogId] = useState<string | null>(
    null
  );
  const [addChannelsDialogOpen, setAddChannelsDialogOpen] = useState(false);

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
        router.refresh();
      })
      .catch(err =>
        toast({
          title: 'Communications',
          description: err.message,
        })
      );
  };

  return (
    <div className="space-y-6">
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
        <BulkAddChannelsButton emailTemplateCount={emailTemplateCount} />
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
        <CreateCommunicationTemplateSheet />
      </div>

      <CommunicationTemplatesTable
        rows={displayedRows}
        onAddChannels={openAddChannelsDialog}
      />

      {sourceFilter === 'external' && isNil(externalTemplates) && (
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
