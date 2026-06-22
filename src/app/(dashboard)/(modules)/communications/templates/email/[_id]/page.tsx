'use client';

import { EmailTemplateDetail } from '@/components/communications/templates/email-template-detail';
import { use, useMemo } from 'react';

type EmailTemplatePageProps = {
  params: Promise<{
    _id: string;
  }>;
  searchParams: Promise<{
    'editor-open'?: string;
  }>;
};

export default function CommunicationEmailTemplatePage(
  props: EmailTemplatePageProps
) {
  const { _id } = use(props.params);
  const searchParams = use(props.searchParams);
  const editorOpen = useMemo(
    () => searchParams['editor-open'] === 'true',
    [searchParams]
  );

  return <EmailTemplateDetail templateId={_id} editorOpen={editorOpen} />;
}
