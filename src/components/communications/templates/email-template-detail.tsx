'use client';

import { getTemplates } from '@/lib/api/email';
import { migrateFromEmailTemplate } from '@/lib/api/communications/templates';
import { formatCommunicationsApiError } from '@/lib/logic/communications-api-error';
import React, { useEffect, useState } from 'react';
import { EmailTemplate } from '@/lib/models/email';
import { Button } from '@/components/ui/button';
import { Code, Edit, ExternalLink } from 'lucide-react';
import { TemplatePreview } from '@/components/email/templates/templatePreview';
import { TemplateEditor } from '@/components/email/templates/TemplateEditor';
import { HtmlViewer } from '@/components/email/templates/HtmlViewer';
import { isExternallyManaged } from '@/lib/utils/template-utils';
import { useToast } from '@/lib/hooks/use-toast';
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '@/components/ui/page-header';

type EmailTemplateDetailProps = {
  templateId: string;
  editorOpen?: boolean;
};

export function EmailTemplateDetail({
  templateId,
  editorOpen = false,
}: EmailTemplateDetailProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(editorOpen);
  const [showHtmlDialog, setShowHtmlDialog] = useState(false);
  const { toast } = useToast();

  const loadTemplate = async (id: string) => {
    const templateData = await getTemplates({ search: id });
    if (templateData.templateDocuments.length > 0) {
      setTemplate(templateData.templateDocuments[0]);
    } else {
      setTemplate(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        await loadTemplate(templateId);
      } catch (error) {
        console.error('Failed to load template:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();
    setShowEditor(editorOpen);

    return () => {
      cancelled = true;
    };
  }, [templateId, editorOpen]);

  const handleEdit = () => {
    if (!template || isExternallyManaged(template)) {
      toast({
        title: 'External Template',
        description:
          'This template is managed by an external system and cannot be edited here.',
      });
      return;
    }
    setShowEditor(true);
  };

  const refreshTemplate = async () => {
    await loadTemplate(templateId);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Template not found</p>
        </div>
      </div>
    );
  }

  if (showEditor) {
    if (isExternallyManaged(template)) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="max-w-md text-center">
            <ExternalLink className="mx-auto mb-4 h-12 w-12 text-orange-500" />
            <h3 className="mb-2 text-lg font-semibold">External Template</h3>
            <p className="mb-4 text-muted-foreground">
              This template is managed by an external system and cannot be
              edited here.
            </p>
            <Button onClick={() => setShowEditor(false)}>
              Back to Template
            </Button>
          </div>
        </div>
      );
    }

    return (
      <TemplateEditor
        template={template}
        onClose={() => setShowEditor(false)}
        onTemplateUpdate={refreshTemplate}
      />
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader>
        <PageTitle>Template: {template.name}</PageTitle>
        <PageActions>
          {!isExternallyManaged(template) && (
            <Button
              variant="outline"
              onClick={() => setShowHtmlDialog(true)}
              className="flex items-center space-x-2"
            >
              <Code className="h-4 w-4" />
              View HTML
            </Button>
          )}
          <Button onClick={handleEdit} className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            Edit Template
          </Button>
          {!isExternallyManaged(template) && (
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() =>
                migrateFromEmailTemplate({ emailTemplateId: template._id })
                  .then(() =>
                    toast({
                      title: 'Communications',
                      description: 'Unified template created',
                    })
                  )
                  .catch(err =>
                    toast({
                      title: 'Communications',
                      description: formatCommunicationsApiError(err),
                    })
                  )
              }
            >
              Add channels
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <TemplatePreview template={template} onTemplateUpdate={refreshTemplate} />

      <HtmlViewer
        html={template.body || ''}
        templateName={template.name}
        isOpen={showHtmlDialog}
        onClose={() => setShowHtmlDialog(false)}
      />
    </div>
  );
}
