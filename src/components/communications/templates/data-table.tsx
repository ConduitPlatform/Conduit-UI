'use client';

import { DataTable } from '@/components/ui/data-table';
import { CommunicationTemplate } from '@/lib/models/communications/templates';
import { useCommunicationTemplateColumns } from './columns';

export type CommunicationTemplatesResponse = {
  templateDocuments: CommunicationTemplate[];
  count: number;
};

export function CommunicationTemplatesTable({
  data,
}: {
  data: CommunicationTemplatesResponse;
}) {
  const columns = useCommunicationTemplateColumns();

  return (
    <DataTable
      columns={columns}
      data={data.templateDocuments}
      count={data.count}
    />
  );
}
