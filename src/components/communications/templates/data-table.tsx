'use client';

import { DataTable } from '@/components/ui/data-table';
import { TemplateRow } from '@/lib/models/communications/template-row';
import { useTemplateRowColumns } from './columns';

type CommunicationTemplatesTableProps = {
  rows: TemplateRow[];
  onAddChannels: (emailTemplateId: string) => void;
};

export function CommunicationTemplatesTable({
  rows,
  onAddChannels,
}: CommunicationTemplatesTableProps) {
  const columns = useTemplateRowColumns({ onAddChannels });

  return <DataTable columns={columns} data={rows} />;
}
