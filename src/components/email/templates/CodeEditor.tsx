'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  ArrowLeft,
  Eye,
  Code,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { patchTemplates } from '@/lib/api/email';
import { useToast } from '@/lib/hooks/use-toast';
import { EmailTemplate } from '@/lib/models/email';
import {
  validateHandlebarsTemplate,
  compileHandlebarsTemplate,
  generateSampleData,
  validateVariableName,
} from '@/lib/utils/template-utils';

interface CodeEditorProps {
  template: EmailTemplate;
  onClose: () => void;
  onConvertToVisual?: () => void;
  onTemplateUpdate?: () => void;
}

interface Variable {
  name: string;
  description?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  template,
  onClose,
  onConvertToVisual,
  onTemplateUpdate,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [htmlContent, setHtmlContent] = useState(template.body || '');
  const [variables, setVariables] = useState<Variable[]>(
    template.variables?.map(v => ({ name: v })) || []
  );
  const [newVariable, setNewVariable] = useState('');
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize preview data
  useEffect(() => {
    const variableNames = variables.map(v => v.name);
    const initialPreviewData = generateSampleData(variableNames);
    setPreviewData(initialPreviewData);
  }, [variables]);

  // Validate template on content change
  useEffect(() => {
    if (htmlContent.trim()) {
      const validation = validateHandlebarsTemplate(htmlContent);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid Handlebars syntax');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [htmlContent]);

  // Save template
  const saveTemplate = async () => {
    if (!template._id) {
      toast({
        title: 'Error',
        description: 'Template ID is required',
      });
      return;
    }

    if (validationError) {
      toast({
        title: 'Invalid Template',
        description: 'Please fix the Handlebars syntax errors before saving',
      });
      return;
    }

    try {
      await patchTemplates(template._id, {
        body: htmlContent,
      });

      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });

      router.refresh();

      // Notify parent component to refresh template data
      if (onTemplateUpdate) {
        onTemplateUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save template',
      });
    }
  };

  // Add new variable
  const addVariable = () => {
    const trimmedName = newVariable.trim();
    if (!trimmedName) return;

    const validation = validateVariableName(trimmedName);
    if (!validation.isValid) {
      toast({
        title: 'Invalid Variable Name',
        description: validation.error || 'Please enter a valid variable name',
      });
      return;
    }

    if (!variables.find(v => v.name === trimmedName)) {
      setVariables(prev => [...prev, { name: trimmedName }]);
      setNewVariable('');
    } else {
      toast({
        title: 'Variable Exists',
        description: 'A variable with this name already exists',
      });
    }
  };

  // Remove variable
  const removeVariable = (name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name));
  };

  // Update preview data
  const updatePreviewData = (variableName: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [variableName]: value }));
  };

  // Generate preview HTML
  const getPreviewHtml = () => {
    return compileHandlebarsTemplate(htmlContent, previewData);
  };

  return (
    <div className="fixed z-50 inset-0 bg-background/80 backdrop-blur-sm">
      <div className="h-full w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold">
                Edit Template: {template.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Code Editor - Handlebars Template
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            {onConvertToVisual && (
              <Button variant="outline" size="sm" onClick={onConvertToVisual}>
                <Code className="h-4 w-4 mr-2" />
                Open Visual Editor
              </Button>
            )}
            <Button
              onClick={saveTemplate}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <div className="h-full flex flex-col space-y-4">
                {/* HTML Editor */}
                <div className="flex-1">
                  <Label htmlFor="html-content">HTML Template</Label>
                  <Textarea
                    id="html-content"
                    value={htmlContent}
                    onChange={e => setHtmlContent(e.target.value)}
                    className="h-full font-mono text-sm resize-none"
                    placeholder="Enter your HTML template with Handlebars variables..."
                  />
                </div>

                {/* Validation Error */}
                {validationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {/* Preview */}
                {showPreview && (
                  <div className="h-64 border rounded-md">
                    <div className="p-2 border-b bg-muted">
                      <h4 className="text-sm font-medium">Live Preview</h4>
                    </div>
                    <div className="h-full overflow-auto">
                      <iframe
                        srcDoc={getPreviewHtml()}
                        className="w-full h-full"
                        title="Template Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Variables and Settings */}
          <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Variables Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add new variable */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Variable name"
                      value={newVariable}
                      onChange={e => setNewVariable(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addVariable()}
                    />
                    <Button size="sm" onClick={addVariable}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Variables list */}
                  <div className="space-y-2">
                    {variables.map(variable => (
                      <div
                        key={variable.name}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                      >
                        <div className="flex-1">
                          <Badge variant="secondary" className="font-mono">
                            {`{{${variable.name}}}`}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeVariable(variable.name)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {variables.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      No variables defined
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Preview Data Section */}
              {showPreview && variables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Preview Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {variables.map(variable => (
                      <div key={variable.name} className="space-y-1">
                        <Label className="text-xs">{variable.name}</Label>
                        <Input
                          size={1}
                          value={previewData[variable.name] || ''}
                          onChange={e =>
                            updatePreviewData(variable.name, e.target.value)
                          }
                          placeholder={`Enter value for ${variable.name}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Template Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Format:
                    </span>
                    <Badge variant="secondary">Handlebars</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Variables:
                    </span>
                    <span className="text-xs font-medium">
                      {variables.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Status:
                    </span>
                    <span
                      className={`text-xs font-medium ${validationError ? 'text-red-500' : 'text-green-500'}`}
                    >
                      {validationError ? 'Invalid' : 'Valid'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
