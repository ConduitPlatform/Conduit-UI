'use client';

import { getTemplates } from '@/lib/api/email';
import React, { useEffect, useState } from 'react';
import { EmailTemplate } from '@/lib/models/email';
import { Button } from '@/components/ui/button';
import { Code, Edit, ExternalLink } from 'lucide-react';
import { TemplatePreview } from '@/components/email/templates/templatePreview';
import { TemplateEditor } from '@/components/email/templates/TemplateEditor';
import { CodeEditor } from '@/components/email/templates/CodeEditor';
import { HtmlViewer } from '@/components/email/templates/HtmlViewer';
import {
  canUseVisualEditor,
  isExternallyManaged,
} from '@/lib/utils/template-utils';
import { useToast } from '@/lib/hooks/use-toast';
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '@/components/ui/page-header';

type EmailTemplateProps = {
  params: Promise<{
    _id: string;
  }>;
  searchParams: Promise<{
    'editor-open': string;
  }>;
};

export default function EmailTemplates(props: EmailTemplateProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showHtmlDialog, setShowHtmlDialog] = useState(false);
  const [params, setParams] = useState<{ _id: string } | null>(null);
  const [forceVisualEditor, setForceVisualEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializePage = async () => {
      const resolvedParams = await props.params;
      const searchParams = await props.searchParams;

      setParams(resolvedParams);
      setShowEditor(searchParams['editor-open'] === 'true');

      try {
        const templateData = await getTemplates({ search: resolvedParams._id });
        if (templateData.templateDocuments.length > 0) {
          setTemplate(templateData.templateDocuments[0]);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [props]);

  const handleConvertToVisual = () => {
    if (!template) return;

    // Set flag to force visual editor and open editor
    // The conversion will happen when the user saves the template in the visual editor
    setForceVisualEditor(true);
    setShowEditor(true);
  };

  const handleEdit = () => {
    if (isExternallyManaged(template!)) {
      toast({
        title: 'External Template',
        description:
          'This template is managed by an external system and cannot be edited here.',
      });
      return;
    }

    // Reset force flag for regular edit
    setForceVisualEditor(false);

    if (canUseVisualEditor(template!)) {
      setShowEditor(true);
    } else {
      // For templates without jsonTemplate, show code editor
      setShowEditor(true);
    }
  };

  const refreshTemplate = async () => {
    if (!params?._id) return;

    try {
      const templateData = await getTemplates({ search: params._id });
      if (templateData.templateDocuments.length > 0) {
        setTemplate(templateData.templateDocuments[0]);
      }
    } catch (error) {
      console.error('Failed to refresh template:', error);
    }
  };

  const handleViewHtml = () => {
    setShowHtmlDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Template not found</p>
        </div>
      </div>
    );
  }

  // Show appropriate editor based on template type
  if (showEditor) {
    if (isExternallyManaged(template)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <ExternalLink className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">External Template</h3>
            <p className="text-muted-foreground mb-4">
              This template is managed by an external system and cannot be
              edited here.
            </p>
            <Button
              onClick={() => {
                setShowEditor(false);
                setForceVisualEditor(false);
              }}
            >
              Back to Template
            </Button>
          </div>
        </div>
      );
    }

    if (forceVisualEditor || canUseVisualEditor(template)) {
      return (
        <TemplateEditor
          template={template}
          onClose={() => {
            setShowEditor(false);
            setForceVisualEditor(false);
          }}
          onTemplateUpdate={refreshTemplate}
        />
      );
    } else {
      return (
        <CodeEditor
          template={template}
          onClose={() => setShowEditor(false)}
          onConvertToVisual={handleConvertToVisual}
          onTemplateUpdate={refreshTemplate}
        />
      );
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader>
        <PageTitle>Template: {template.name}</PageTitle>
        <PageActions>
          {!isExternallyManaged(template) && (
            <Button
              variant="outline"
              onClick={handleViewHtml}
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
        </PageActions>
      </PageHeader>

      <TemplatePreview
        template={template}
        onEdit={handleEdit}
        onConvertToVisual={
          !canUseVisualEditor(template) ? handleConvertToVisual : undefined
        }
        onViewHtml={handleViewHtml}
        onTemplateUpdate={refreshTemplate}
      />

      {/* HTML Viewer */}
      <HtmlViewer
        html={template.body || ''}
        templateName={template.name}
        isOpen={showHtmlDialog}
        onClose={() => setShowHtmlDialog(false)}
      />
    </div>
  );
}
