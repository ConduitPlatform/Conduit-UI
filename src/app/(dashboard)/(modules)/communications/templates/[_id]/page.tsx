'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommunicationTemplate } from '@/lib/models/communications/templates';
import {
  getCommunicationTemplates,
  updateCommunicationTemplate,
} from '@/lib/api/communications/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

type CommunicationTemplatePageProps = {
  params: Promise<{ _id: string }>;
};

export default function CommunicationTemplateDetailPage(
  props: CommunicationTemplatePageProps
) {
  const [template, setTemplate] = useState<CommunicationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { _id } = await props.params;
      try {
        const data = await getCommunicationTemplates({ search: _id, limit: 1 });
        if (data.templateDocuments[0]) {
          setTemplate(data.templateDocuments[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [props]);

  const handleSave = async (values: CommunicationTemplateFormValues) => {
    if (!template) return;
    await updateCommunicationTemplate(template._id, values)
      .then(updated => {
        setTemplate(updated);
        setEditing(false);
        toast({
          title: 'Communications',
          description: 'Template updated',
        });
        router.refresh();
      })
      .catch(err =>
        toast({ title: 'Communications', description: err.message })
      );
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading template...</p>;
  }

  if (!template) {
    return <p className="text-muted-foreground">Template not found</p>;
  }

  const defaultValues: CommunicationTemplateFormValues = {
    name: template.name,
    templateDescription: template.summary,
    channels: template.channels,
    email: template.email,
    push: template.push,
    sms: template.sms,
  };

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageTitle>{template.name}</PageTitle>
        <PageActions>
          <Button
            variant={editing ? 'secondary' : 'default'}
            onClick={() => setEditing(current => !current)}
          >
            {editing ? 'Cancel edit' : 'Edit template'}
          </Button>
        </PageActions>
      </PageHeader>

      {!editing && (
        <div className="space-y-4 rounded-lg border p-4">
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
          {template.variables && template.variables.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Variables</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map(variable => (
                  <Badge key={variable} variant="outline">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {editing && (
        <CommunicationTemplateForm
          defaultValues={defaultValues}
          disableName
          submitLabel="Save changes"
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
