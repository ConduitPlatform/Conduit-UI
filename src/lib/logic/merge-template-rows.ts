import {
  TemplateRow,
  getTemplateRowName,
} from '@/lib/models/communications/template-row';
import { CommunicationTemplate } from '@/lib/models/communications/templates';
import { EmailTemplate, ExternalTemplate } from '@/lib/models/email';

export function mergeTemplateRows(
  communicationTemplates: CommunicationTemplate[],
  emailTemplates: EmailTemplate[],
  externalTemplates: ExternalTemplate[] | null
): TemplateRow[] {
  const unifiedNames = new Set(
    communicationTemplates.map(template => template.name)
  );

  const rows: TemplateRow[] = [
    ...communicationTemplates.map(template => ({
      kind: 'unified' as const,
      template,
    })),
    ...emailTemplates
      .filter(template => !unifiedNames.has(template.name))
      .map(template => ({
        kind: 'email' as const,
        template,
      })),
  ];

  if (externalTemplates) {
    rows.push(
      ...externalTemplates.map(template => ({
        kind: 'external' as const,
        template,
      }))
    );
  }

  return rows.sort((a, b) =>
    getTemplateRowName(a).localeCompare(getTemplateRowName(b))
  );
}
