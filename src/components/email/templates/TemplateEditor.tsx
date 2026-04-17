'use client';

import React, { useRef, useState, useCallback } from 'react';
import { EmailEditor, type EmailEditorRef } from '@react-email/editor';
import { Inspector } from '@react-email/editor/ui';
import '@react-email/editor/themes/default.css';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { patchTemplates } from '@/lib/api/email';
import { useToast } from '@/lib/hooks/use-toast';
import { EmailTemplate } from '@/lib/models/email';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, Plus, X, Code, Eye } from 'lucide-react';
import { validateVariableName } from '@/lib/utils/template-utils';

interface TemplateEditorProps {
  template: EmailTemplate;
  onClose: () => void;
  onTemplateUpdate?: () => void;
}

interface Variable {
  name: string;
}

const uploadImageAsDataUrl = async (file: File): Promise<{ url: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string });
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onClose,
  onTemplateUpdate,
}) => {
  const editorRef = useRef<EmailEditorRef>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [variables, setVariables] = useState<Variable[]>(
    template.variables?.map(v => ({ name: v })) || []
  );
  const [newVariable, setNewVariable] = useState('');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'visual' | 'source'>('visual');
  const [sourceHtml, setSourceHtml] = useState(template.body || '');

  const switchToSource = useCallback(async () => {
    if (editorRef.current) {
      const html = await editorRef.current.getEmailHTML();
      setSourceHtml(html);
    }
    setMode('source');
  }, []);

  const switchToVisual = useCallback(() => {
    setMode('visual');
  }, []);

  const saveTemplate = useCallback(async () => {
    if (!template._id) {
      toast({ title: 'Error', description: 'Template ID is required' });
      return;
    }

    setSaving(true);
    try {
      let finalHtml: string;

      if (mode === 'visual' && editorRef.current) {
        finalHtml = await editorRef.current.getEmailHTML();
      } else {
        finalHtml = sourceHtml;
      }

      await patchTemplates(template._id, { body: finalHtml });

      toast({ title: 'Success', description: 'Template saved successfully' });
      router.refresh();
      onTemplateUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save template',
      });
    } finally {
      setSaving(false);
    }
  }, [template._id, mode, sourceHtml, router, toast, onTemplateUpdate]);

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

  const removeVariable = (name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name));
  };

  return (
    <div className="fixed z-50 inset-0 bg-background backdrop-blur-xs">
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
                {mode === 'visual' ? 'Visual Editor' : 'Source Editor'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {mode === 'visual' ? (
              <Button variant="outline" size="sm" onClick={switchToSource}>
                <Code className="h-4 w-4 mr-2" />
                View Source
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={switchToVisual}>
                <Eye className="h-4 w-4 mr-2" />
                Visual Editor
              </Button>
            )}
            <Button
              onClick={saveTemplate}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {mode === 'visual' ? (
            <>
              <div className="flex-1 flex min-h-0 min-w-0">
                <EmailEditor
                  ref={editorRef}
                  content={
                    template.body || '<p>Start editing your template...</p>'
                  }
                  theme="basic"
                  className="flex-1 min-w-0 overflow-y-auto"
                  onUploadImage={uploadImageAsDataUrl}
                >
                  <Inspector.Root className="w-64 shrink-0 border-l p-4 overflow-y-auto">
                    <Inspector.Breadcrumb />
                    <Inspector.Document />
                    <Inspector.Node />
                    <Inspector.Text />
                  </Inspector.Root>
                </EmailEditor>
              </div>

              {/* Variables sidebar */}
              <div className="w-72 shrink-0 border-l bg-muted/30 p-4 overflow-y-auto">
                <VariablesSidebar
                  variables={variables}
                  newVariable={newVariable}
                  onNewVariableChange={setNewVariable}
                  onAdd={addVariable}
                  onRemove={removeVariable}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 p-4 min-h-0">
                <Textarea
                  value={sourceHtml}
                  onChange={e => setSourceHtml(e.target.value)}
                  className="h-full font-mono text-sm resize-none"
                  placeholder="Enter your HTML template..."
                />
              </div>

              <div className="w-72 shrink-0 border-l bg-muted/30 p-4 overflow-y-auto">
                <VariablesSidebar
                  variables={variables}
                  newVariable={newVariable}
                  onNewVariableChange={setNewVariable}
                  onAdd={addVariable}
                  onRemove={removeVariable}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function VariablesSidebar({
  variables,
  newVariable,
  onNewVariableChange,
  onAdd,
  onRemove,
}: {
  variables: Variable[];
  newVariable: string;
  onNewVariableChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (name: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Template Variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Use <code className="text-xs">{'{{variableName}}'}</code> in your
          template to insert dynamic content.
        </p>
        <div className="flex space-x-2">
          <Input
            placeholder="Variable name"
            value={newVariable}
            onChange={e => onNewVariableChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAdd()}
          />
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {variables.map(variable => (
            <div
              key={variable.name}
              className="flex items-center justify-between p-2 bg-background rounded border"
            >
              <Badge variant="secondary" className="font-mono">
                {`{{${variable.name}}}`}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(variable.name)}
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
  );
}
