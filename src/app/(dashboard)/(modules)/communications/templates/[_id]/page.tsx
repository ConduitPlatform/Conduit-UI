'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CommunicationTemplate } from '@/lib/models/communications/templates';
import {
  getCommunicationTemplate,
  updateCommunicationTemplate,
} from '@/lib/api/communications/templates';
import { formatCommunicationsApiError } from '@/lib/logic/api-error';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import {
  PageHeader,
  PageTitle,
  PageActions,
} from '@/components/ui/page-header';
import {
  CommunicationTemplateForm,
  CommunicationTemplateFormValues,
} from '@/components/communications/templates/template-form';
import { EmailTemplatePreview } from '@/components/communications/templates/email-template-preview';
import { EmailBodyEditor } from '@/components/communications/templates/email-body-editor';
import { HtmlViewer } from '@/components/email/templates/HtmlViewer';
import { Code, Edit } from 'lucide-react';

type CommunicationTemplatePageProps = {
  params: Promise<{ _id: string }>;
};

export default function CommunicationTemplateDetailPage(
  props: CommunicationTemplatePageProps
) {
  const [template, setTemplate] = useState<CommunicationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showHtmlDialog, setShowHtmlDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const loadTemplate = async (id: string) => {
    const data = await getCommunicationTemplate(id);
    setTemplate(data);
  };

  useEffect(() => {
    const init = async () => {
      const { _id } = await props.params;
      try {
        await loadTemplate(_id);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Communications',
          description: formatCommunicationsApiError(error),
        });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [props, toast]);

  useEffect(() => {
    if (
      searchParams.get('editor-open') === 'true' &&
      template?.channels.includes('email')
    ) {
      setShowEmailEditor(true);
    }
  }, [searchParams, template]);

  const handleSaveMetadata = async (
    values: CommunicationTemplateFormValues
  ) => {
    if (!template) return;
    try {
      const updated = await updateCommunicationTemplate(template._id, values);
      setTemplate(updated);
      setEditingMetadata(false);
      toast({
        title: 'Communications',
        description: 'Template updated',
      });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Communications',
        description: formatCommunicationsApiError(err),
      });
    }
  };

  const handleSaveEmailBody = async (html: string, variables: string[]) => {
    if (!template) return;
    const updated = await updateCommunicationTemplate(template._id, {
      email: {
        ...template.email,
        body: html,
      },
      variables,
    });
    setTemplate(updated);
    setShowEmailEditor(false);
    router.refresh();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading template...</p>;
  }

  if (!template) {
    return <p className="text-muted-foreground">Template not found</p>;
  }

  if (showEmailEditor && template.channels.includes('email')) {
    return (
      <EmailBodyEditor
        title={`Edit email: ${template.name}`}
        html={template.email?.body || '<p></p>'}
        variables={template.variables}
        onSave={handleSaveEmailBody}
        onClose={() => setShowEmailEditor(false)}
      />
    );
  }

  const defaultValues: CommunicationTemplateFormValues = {
    name: template.name,
    templateDescription: template.summary,
    channels: template.channels,
    email: template.email,
    push: template.push,
    sms: template.sms,
  };

  const hasEmail = template.channels.includes('email');
  const hasPush = template.channels.includes('push');
  const hasSms = template.channels.includes('sms');

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageTitle>{template.name}</PageTitle>
        <PageActions>
          {hasEmail && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowHtmlDialog(true)}
                className="flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                View HTML
              </Button>
              <Button
                onClick={() => setShowEmailEditor(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit email
              </Button>
            </>
          )}
          <Button
            variant={editingMetadata ? 'secondary' : 'default'}
            onClick={() => setEditingMetadata(current => !current)}
          >
            {editingMetadata ? 'Cancel edit' : 'Edit channels & content'}
          </Button>
        </PageActions>
      </PageHeader>

      {!editingMetadata && (
        <div className="space-y-6">
          {template.summary && (
            <p className="text-sm text-muted-foreground">{template.summary}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {template.channels.map(channel => (
              <Badge key={channel} variant="secondary" className="capitalize">
                {channel}
              </Badge>
            ))}
          </div>

          {hasEmail && (
            <EmailTemplatePreview
              template={{
                name: template.name,
                subject: template.email?.subject,
                sender: template.email?.sender,
                body: template.email?.body,
                variables: template.variables,
                createdAt: template.createdAt,
              }}
              readOnlyDetails
            />
          )}

          {hasPush && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Push notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Title: </span>
                  {template.push?.title || '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Body: </span>
                  {template.push?.body || '—'}
                </p>
              </CardContent>
            </Card>
          )}

          {hasSms && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SMS</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{template.sms?.message || '—'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {editingMetadata && (
        <CommunicationTemplateForm
          mode="edit"
          defaultValues={defaultValues}
          disableName
          submitLabel="Save changes"
          onSubmit={handleSaveMetadata}
        />
      )}

      {hasEmail && (
        <HtmlViewer
          html={template.email?.body || ''}
          templateName={template.name}
          isOpen={showHtmlDialog}
          onClose={() => setShowHtmlDialog(false)}
        />
      )}
    </div>
  );
}
