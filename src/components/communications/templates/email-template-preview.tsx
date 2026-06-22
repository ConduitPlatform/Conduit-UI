'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Edit, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  generateSampleData,
  compileHandlebarsTemplate,
} from '@/lib/utils/template-utils';

export type EmailPreviewSource = {
  name: string;
  subject?: string;
  sender?: string;
  body?: string;
  variables?: string[];
  externalId?: string;
  createdAt?: string | Date;
  isExternal?: boolean;
};

type EmailTemplatePreviewProps = {
  template: EmailPreviewSource;
  onEdit?: () => void;
  onViewHtml?: () => void;
  readOnlyDetails?: boolean;
};

export function EmailTemplatePreview({
  template,
  onEdit,
  onViewHtml,
  readOnlyDetails = false,
}: EmailTemplatePreviewProps) {
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    'preview' | 'variables' | 'details'
  >('preview');

  useEffect(() => {
    if (template.variables && template.variables.length > 0) {
      setPreviewData(generateSampleData(template.variables));
    }
  }, [template.variables]);

  const getPreviewHtml = () => {
    if (!template.body) return '';
    return compileHandlebarsTemplate(template.body, previewData);
  };

  const updatePreviewData = (variableName: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [variableName]: value }));
  };

  if (template.isExternal) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-orange-500" />
              <span>External Template</span>
            </CardTitle>
            <Badge variant="secondary">External</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-300">
                Externally managed template
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                This template is managed by your email provider. Update it in
                the provider&apos;s interface.
              </p>
            </div>
          </div>
          <PreviewTabs
            template={template}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            previewData={previewData}
            onPreviewDataChange={updatePreviewData}
            getPreviewHtml={getPreviewHtml}
            readOnlyDetails
          />
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
                <Code className="mr-2 h-4 w-4" />
                View HTML
              </Button>
            )}
            {onEdit && (
              <Button size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PreviewTabs
          template={template}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          previewData={previewData}
          onPreviewDataChange={updatePreviewData}
          getPreviewHtml={getPreviewHtml}
          readOnlyDetails={readOnlyDetails}
        />
      </CardContent>
    </Card>
  );
}

function PreviewTabs({
  template,
  activeTab,
  onTabChange,
  previewData,
  onPreviewDataChange,
  getPreviewHtml,
  readOnlyDetails,
}: {
  template: EmailPreviewSource;
  activeTab: 'preview' | 'variables' | 'details';
  onTabChange: (tab: 'preview' | 'variables' | 'details') => void;
  previewData: Record<string, string>;
  onPreviewDataChange: (name: string, value: string) => void;
  getPreviewHtml: () => string;
  readOnlyDetails: boolean;
}) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={value =>
        onTabChange(value as 'preview' | 'variables' | 'details')
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
          <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-muted/40 px-4 py-2">
              <div className="text-sm text-muted-foreground">
                <strong>Subject:</strong> {template.subject || 'No subject'}
              </div>
              {template.sender && (
                <div className="text-sm text-muted-foreground">
                  <strong>From:</strong> {template.sender}
                </div>
              )}
            </div>
            <div className="h-96 overflow-auto">
              <iframe
                srcDoc={getPreviewHtml()}
                className="h-full w-full"
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {template.variables.map(variable => (
                <div key={variable} className="space-y-1">
                  <Label className="text-sm font-medium">{variable}</Label>
                  <Input
                    value={previewData[variable] || ''}
                    onChange={e =>
                      onPreviewDataChange(variable, e.target.value)
                    }
                    placeholder={`Enter value for ${variable}`}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const sampleData = generateSampleData(template.variables || []);
                Object.entries(sampleData).forEach(([key, value]) =>
                  onPreviewDataChange(key, value)
                );
              }}
            >
              Reset to sample data
            </Button>
          </div>
        </TabsContent>
      )}

      <TabsContent value="details" className="space-y-4">
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
            <strong>Variables:</strong> {template.variables?.length || 0}
          </div>
          {template.externalId && (
            <div>
              <strong>External ID:</strong> {template.externalId}
            </div>
          )}
          {template.createdAt && (
            <div>
              <strong>Created:</strong>{' '}
              {new Date(template.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
        {readOnlyDetails && (
          <p className="text-sm text-muted-foreground">
            Template details are read-only.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
