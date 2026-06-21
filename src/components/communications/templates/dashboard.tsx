'use client';

import { CommunicationTemplatesResponse } from './data-table';
import { CommunicationTemplatesTable } from './data-table';
import { SearchInput } from '@/components/helpers/search';
import { CreateCommunicationTemplateSheet } from './create-template-sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export function CommunicationTemplatesDashboard({
  data,
}: {
  data: CommunicationTemplatesResponse;
}) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Unified templates</AlertTitle>
        <AlertDescription>
          Manage multi-channel templates used by orchestrated sends. Email-only
          templates remain available under{' '}
          <Link
            href="/email/templates"
            className="underline underline-offset-3"
          >
            Email → Templates
          </Link>
          .
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-3">
        <SearchInput />
        <CreateCommunicationTemplateSheet />
      </div>

      <CommunicationTemplatesTable data={data} />
    </div>
  );
}
