'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { createCommunicationTemplate } from '@/lib/api/communications/templates';
import { formatCommunicationsApiError } from '@/lib/logic/api-error';
import {
  CommunicationTemplateForm,
  CommunicationTemplateFormValues,
} from './template-form';

const EMAIL_BODY_PLACEHOLDER = '<p></p>';

export function CreateCommunicationTemplateSheet() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (values: CommunicationTemplateFormValues) => {
    const payload = { ...values };

    if (payload.channels.includes('email')) {
      payload.email = {
        ...payload.email,
        body: EMAIL_BODY_PLACEHOLDER,
      };
    }

    try {
      const created = await createCommunicationTemplate(payload);
      toast({
        title: 'Communications',
        description: 'Template created',
      });
      setOpen(false);

      const openEditor = payload.channels.includes('email');
      router.push(
        openEditor
          ? `/communications/templates/${created._id}?editor-open=true`
          : '/communications/templates'
      );
      router.refresh();
    } catch (err) {
      toast({
        title: 'Communications',
        description: formatCommunicationsApiError(err),
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create template</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CommunicationTemplateForm
            mode="create"
            submitLabel="Create template"
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
