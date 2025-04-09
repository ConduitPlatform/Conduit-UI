import { EmailEditorWrapper } from '@/components/email/email-editor';
import { getTemplates } from '@/lib/api/email';
import React from 'react';
import { TemplatePreviewForm } from '@/components/email/templates/templatePreview';

type EmailTemplateProps = {
  params: {
    _id: string;
  };
  searchParams: {
    'editor-open': string;
  };
};
export default async function EmailTemplates({
  params,
  searchParams,
}: EmailTemplateProps) {
  const openEditor = searchParams['editor-open'] === 'true';
  const template = await getTemplates({ search: params._id });
  if (!template.templateDocuments.length) {
    return <>NOT FOUND</>;
  }
  return (
    <>
      {openEditor && (
        <EmailEditorWrapper
          templateId={params._id}
          sample={
            template.templateDocuments[0]?.jsonTemplate
              ? JSON.parse(template.templateDocuments[0]?.jsonTemplate)
              : undefined
          }
        />
      )}
      <div className="flex flex-col space-y-4">
        <span className="text-2xl font-medium">Details</span>
        <TemplatePreviewForm template={template.templateDocuments[0]} />
      </div>
    </>
  );
}
