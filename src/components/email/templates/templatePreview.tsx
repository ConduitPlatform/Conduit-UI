'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Code,
  Edit,
  ExternalLink,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { EmailTemplate } from '@/lib/models/email';
import {
  isExternallyManaged,
  generateSampleData,
  compileHandlebarsTemplate,
} from '@/lib/utils/template-utils';
import { patchTemplates } from '@/lib/api/email';
import { useToast } from '@/lib/hooks/use-toast';

interface TemplatePreviewProps {
  template: EmailTemplate;
  onEdit?: () => void;
  onViewHtml?: () => void;
  onTemplateUpdate?: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onEdit,
  onViewHtml,
  onTemplateUpdate,
}) => {
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    'preview' | 'variables' | 'details'
  >('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: template.name,
    subject: template.subject || '',
    sender: template.sender || '',
  });

  // Initialize preview data
  useEffect(() => {
    if (template.variables && template.variables.length > 0) {
      const sampleData = generateSampleData(template.variables);
      setPreviewData(sampleData);
    }
  }, [template.variables]);

  // Update templateData when template prop changes
  useEffect(() => {
    setTemplateData({
      name: template.name,
      subject: template.subject || '',
      sender: template.sender || '',
    });
  }, [template.name, template.subject, template.sender]);

  // Generate preview HTML
  const getPreviewHtml = () => {
    if (!template.body) return '';
    return compileHandlebarsTemplate(template.body, previewData);
  };

  // Update preview data
  const updatePreviewData = (variableName: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [variableName]: value }));
  };

  // Save template details
  const saveTemplateDetails = async () => {
    try {
      await patchTemplates(template._id, {
        name: templateData.name,
        subject: templateData.subject,
        sender: templateData.sender,
      });

      toast({
        title: 'Success',
        description: 'Template details saved successfully',
      });

      setIsEditing(false);

      // Notify parent component to refresh template data
      if (onTemplateUpdate) {
        onTemplateUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save template details',
      });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setTemplateData({
      name: template.name,
      subject: template.subject || '',
      sender: template.sender || '',
    });
    setIsEditing(false);
  };

  if (isExternallyManaged(template)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-callout-warning-foreground" />
              <span>External Template</span>
            </CardTitle>
            <Badge
              variant="outline"
              className="border-callout-warning bg-callout-warning-muted text-callout-warning-foreground"
            >
              External
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 rounded-lg border border-callout-warning bg-callout-warning-muted p-4">
            <AlertTriangle className="h-5 w-5 text-callout-warning-foreground" />
            <div>
              <h4 className="font-medium text-callout-warning-foreground">
                Externally Managed Template
              </h4>
              <p className="text-sm text-callout-warning-foreground">
                This template is managed by an external system. To modify this
                template, please update it in the external email provider&apos;s
                interface.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Template Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Name:</strong> {template.name}
              </div>
              {template.subject && (
                <div>
                  <strong>Subject:</strong> {template.subject}
                </div>
              )}
              {template.sender && (
                <div>
                  <strong>Sender:</strong> {template.sender}
                </div>
              )}
              {template.externalId && (
                <div>
                  <strong>External ID:</strong> {template.externalId}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Template Preview</span>
          </CardTitle>
          <div className="flex space-x-2">
            {onViewHtml && (
              <Button variant="outline" size="sm" onClick={onViewHtml}>
                <Code className="h-4 w-4 mr-2" />
                View HTML
              </Button>
            )}
            {onEdit && (
              <Button size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={value =>
            setActiveTab(value as 'preview' | 'variables' | 'details')
          }
        >
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {template.variables && template.variables.length > 0 && (
              <TabsTrigger value="variables">
                Variables ({template.variables.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Email Preview</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="border-b bg-surface-2 px-4 py-2">
                  <div className="text-sm text-foreground-muted">
                    <strong>Subject:</strong> {template.subject || 'No subject'}
                  </div>
                  {template.sender && (
                    <div className="text-sm text-foreground-muted">
                      <strong>From:</strong> {template.sender}
                    </div>
                  )}
                </div>
                <div className="h-96 overflow-auto">
                  <iframe
                    srcDoc={getPreviewHtml()}
                    className="w-full h-full"
                    title="Template Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {template.variables && template.variables.length > 0 && (
            <TabsContent value="variables" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Template Variables</h4>
                <p className="text-sm text-muted-foreground">
                  Adjust the values below to see how they affect the template
                  preview.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.variables.map(variable => (
                    <div key={variable} className="space-y-1">
                      <Label className="text-sm font-medium">{variable}</Label>
                      <Input
                        value={previewData[variable] || ''}
                        onChange={e =>
                          updatePreviewData(variable, e.target.value)
                        }
                        placeholder={`Enter value for ${variable}`}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sampleData = generateSampleData(
                        template.variables || []
                      );
                      setPreviewData(sampleData);
                    }}
                  >
                    Reset to Sample Data
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Template Details</h4>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveTemplateDetails}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateData.name}
                      onChange={e =>
                        setTemplateData(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter template name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Subject</Label>
                    <Input
                      id="template-subject"
                      value={templateData.subject}
                      onChange={e =>
                        setTemplateData(prev => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-sender">Sender Email</Label>
                    <Input
                      id="template-sender"
                      value={templateData.sender}
                      onChange={e =>
                        setTemplateData(prev => ({
                          ...prev,
                          sender: e.target.value,
                        }))
                      }
                      placeholder="Enter sender email"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {template.name}
                    </div>
                    <div>
                      <strong>Subject:</strong> {template.subject || 'Not set'}
                    </div>
                    <div>
                      <strong>Sender:</strong> {template.sender || 'Not set'}
                    </div>
                    <div>
                      <strong>Variables:</strong>{' '}
                      {template.variables?.length || 0}
                    </div>
                    <div>
                      <strong>Created:</strong>{' '}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
