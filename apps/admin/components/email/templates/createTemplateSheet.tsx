'use client';

import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { TemplateForm } from '@/components/email/templates/templateForm';
import { createTemplate } from '@/lib/api/email';
import { useRouter } from 'next/navigation';
import { PlusCircleIcon } from 'lucide-react';

const schema = z.object({
  name: z.string(),
  subject: z.string(),
  sender: z.string().optional(),
  body: z.string(),
  externalManaged: z.boolean().default(false),
});

const dummyHTML =
  '<!DOCTYPE html><html lang="en"><head><title>Page Title</title></head><body><h1>This is a Heading</h1><p>This is a paragraph.</p></body></html>';

export const CreateTemplateSheet = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      body: dummyHTML,
    },
  });

  return (
    <Sheet open={open} onOpenChange={open => setOpen(open)}>
      <SheetTrigger asChild>
        <PlusCircleIcon className="w-4 h-4" />
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xl w-[750px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async data => {
                const templateId = await createTemplate(data).then(
                  res => res.template._id
                );
                router.push(`/email/templates/${templateId}?editor-open=true`);
              },
              errors => console.log(errors)
            )}
            className="space-y-4"
          >
            <TemplateForm
              children={<>Save template details and continue to editor</>}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
