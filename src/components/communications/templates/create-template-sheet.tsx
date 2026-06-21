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
import {
  CommunicationTemplateForm,
  CommunicationTemplateFormValues,
} from './template-form';

export function CreateCommunicationTemplateSheet() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (values: CommunicationTemplateFormValues) => {
    await createCommunicationTemplate(values)
      .then(() => {
        toast({
          title: 'Communications',
          description: 'Unified template created',
        });
        setOpen(false);
        router.refresh();
      })
      .catch(err =>
        toast({ title: 'Communications', description: err.message })
      );
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
          <SheetTitle>Create unified template</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CommunicationTemplateForm
            submitLabel="Create template"
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
