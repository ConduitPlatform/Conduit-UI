'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { patchTemplates } from '@/lib/api/email';
import { useToast } from '@/lib/hooks/use-toast';
import { EmailTemplate } from '@/lib/models/email';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import {
  generateSampleData,
  validateVariableName,
  createBasicVisualDesign,
} from '@/lib/utils/template-utils';

interface TemplateEditorProps {
  template: EmailTemplate;
  onClose: () => void;
  onTemplateUpdate?: () => void;
}

interface Variable {
  name: string;
  description?: string;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onClose,
  onTemplateUpdate,
}) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [variables, setVariables] = useState<Variable[]>(
    template.variables?.map(v => ({ name: v })) || []
  );
  const [newVariable, setNewVariable] = useState('');

  // Load design into visual editor
  const onLoad: EmailEditorProps['onLoad'] = useCallback(
    (unlayer: any) => {
      if (template.jsonTemplate) {
        try {
          const design = JSON.parse(template.jsonTemplate);

          // Validate the design structure before loading
          if (design && (design.body || design.design)) {
            try {
              unlayer.loadDesign(design);
            } catch (loadError) {
              console.warn('Failed to load design, using fallback:', loadError);
              unlayer.loadBlank();
            }
          } else {
            console.warn('Invalid design structure, using blank');
            unlayer.loadBlank();
          }
        } catch (error) {
          console.error('Failed to parse design JSON, using blank:', error);
          unlayer.loadBlank();
        }
      } else {
        unlayer.loadBlank();
      }
    },
    [template.jsonTemplate, template.body]
  );

  // Save template
  const saveTemplate = useCallback(async () => {
    if (!template._id) {
      toast({
        title: 'Error',
        description: 'Template ID is required',
      });
      return;
    }

    try {
      let finalHtml = template.body;
      let jsonTemplate = null;

      // Export from visual editor
      const unlayer = emailEditorRef.current?.editor;
      if (unlayer) {
        await new Promise<void>((resolve, reject) => {
          unlayer.exportHtml(data => {
            finalHtml = data.html;
            jsonTemplate = JSON.stringify(data.design);
            resolve();
          });
        });
      }

      // Check if this is a conversion from code editor to visual editor
      const isConversion = !template.jsonTemplate;

      // Update template with new content
      await patchTemplates(template._id, {
        body: finalHtml,
        jsonTemplate,
      });

      if (isConversion) {
        toast({
          title: 'Template Converted & Saved',
          description:
            'Template has been converted to visual editor format and saved successfully',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Template saved successfully',
        });
      }

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
  }, [template._id, template.body, template.jsonTemplate, router, toast]);

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

  return (
    <div className="fixed z-50 inset-0 bg-background/80 backdrop-blur-xs">
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
              <p className="text-sm text-muted-foreground">Visual Editor</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
            <div className="h-full">
              <EmailEditor
                ref={emailEditorRef}
                onLoad={onLoad}
                options={{
                  version: 'latest',
                  customJS: [
                    window.location.origin + '/email-editor-custom.js',
                  ],
                }}
              />
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
                    <Badge variant="default">Visual Editor</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Variables:
                    </span>
                    <span className="text-xs font-medium">
                      {variables.length}
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
