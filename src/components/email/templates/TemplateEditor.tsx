'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { patchTemplates } from '@/lib/api/email';
import { EmailTemplate } from '@/lib/models/email';
import { EmailBodyEditor } from '@/components/communications/templates/email-body-editor';

interface TemplateEditorProps {
  template: EmailTemplate;
  onClose: () => void;
  onTemplateUpdate?: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onClose,
  onTemplateUpdate,
}) => {
  const router = useRouter();

  const handleSave = async (html: string) => {
    await patchTemplates(template._id, {
      body: html,
    });
    router.refresh();
    onTemplateUpdate?.();
  };

  return (
    <EmailBodyEditor
      title={`Edit Template: ${template.name}`}
      html={template.body || ''}
      variables={template.variables}
      onSave={html => handleSave(html)}
      onClose={onClose}
    />
  );
};
