'use client';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { patchTemplates } from '@/lib/api/email';
import { useToast } from '@/lib/hooks/use-toast';

export const EmailEditorWrapper = ({
  sample,
  templateId,
}: {
  sample?: any;
  templateId?: string;
}) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const router = useRouter();
  const { toast } = useToast();

  const saveDesign = () => {
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.exportHtml(data => {
      const { html, design } = data;
      if (!templateId) {
        toast({
          title: 'Email',
          description: 'Please first create a template to save design',
        });
        return;
      }
      patchTemplates(templateId, {
        body: html,
        jsonTemplate: JSON.stringify(design),
      })
        .then(() => {
          toast({
            title: 'Email',
            description: 'Template saved successfully',
          });
          router.push('/email/templates');
        })
        .catch(err =>
          toast({
            title: 'Email',
            description: err.message,
          })
        );
    });
  };

  const onLoad: EmailEditorProps['onLoad'] = unlayer => {
    if (sample) {
      unlayer.loadDesign(sample);
    } else {
      unlayer.loadBlank();
    }
  };

  return (
    <div className="fixed z-40 inset-0 bg-white flex items-center justify-center">
      <div className="h-full w-full relative flex flex-col space-y-3">
        <div className="flex place-self-end space-x-3 m-4">
          <Button onClick={saveDesign} variant="secondary" className="w-fit">
            Save Design
          </Button>
          <Button
            onClick={() => {
              if (sample) {
                router.push('/email/templates');
              } else {
                alert('You have unsaved changes. Please save before closing.');
              }
            }}
            variant="default"
            className="w-fit"
          >
            Close
          </Button>
        </div>
        <EmailEditor
          ref={emailEditorRef}
          onLoad={onLoad}
          options={{ version: 'latest' }}
        />
      </div>
    </div>
  );
};
