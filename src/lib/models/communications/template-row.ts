import {
  CommunicationTemplate,
  CommunicationTemplatePayload,
} from '@/lib/models/communications/templates';
import { EmailTemplate, ExternalTemplate } from '@/lib/models/email';

export type TemplateRow =
  | { kind: 'unified'; template: CommunicationTemplate }
  | { kind: 'email'; template: EmailTemplate }
  | { kind: 'external'; template: ExternalTemplate };

export type TemplateFilter = 'all' | 'unified' | 'email' | 'external';

export type ChannelFilter = 'all' | 'email' | 'push' | 'sms';

export type MigrationPlannedItem = {
  sourceId: string;
  sourceName: string;
  target: CommunicationTemplatePayload;
  skipped?: boolean;
  warning?: string;
};

export type MigrationResponse = {
  dryRun: boolean;
  planned: MigrationPlannedItem[];
  created?: CommunicationTemplate[];
  count?: number;
};

export function getTemplateRowName(row: TemplateRow): string {
  return row.template.name;
}

export function getTemplateRowId(row: TemplateRow): string {
  return row.template._id;
}

export function getTemplateRowCreatedAt(row: TemplateRow): string {
  const createdAt = row.template.createdAt;
  return typeof createdAt === 'string' ? createdAt : createdAt.toISOString();
}

export function getTemplateRowVariablesCount(row: TemplateRow): number {
  return row.template.variables?.length ?? 0;
}

export function filterTemplateRows(
  rows: TemplateRow[],
  filter: TemplateFilter
): TemplateRow[] {
  switch (filter) {
    case 'all':
      return rows;
    case 'unified':
      return rows.filter(row => row.kind === 'unified');
    case 'email':
      return rows.filter(row => row.kind === 'email');
    case 'external':
      return rows.filter(row => row.kind === 'external');
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export function rowMatchesChannel(
  row: TemplateRow,
  channel: ChannelFilter
): boolean {
  if (channel === 'all') return true;
  switch (row.kind) {
    case 'email':
    case 'external':
      return channel === 'email';
    case 'unified':
      return row.template.channels.includes(channel);
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
}
