'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailTemplate } from '@/lib/models/email';
import { patchTemplates } from '@/lib/api/email';
import { TemplateForm } from '@/components/email/templates/templateForm';
import { Form } from '@/components/ui/form';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const schema = z.object({
  name: z.string().optional(),
  subject: z.string().optional(),
  sender: z.string().optional(),
  body: z.string().optional(),
  externalManaged: z.boolean().optional(),
  jsonTemplate: z.string().optional(),
});

export const TemplatePreviewForm = ({
  template,
}: {
  template: EmailTemplate;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template.name,
      subject: template.subject,
      sender: template.sender,
      body: template.body,
      jsonTemplate: template.jsonTemplate,
      externalManaged: template.externalManaged,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          async data => {
            await patchTemplates(template._id, data);
            router.refresh();
          },
          errors => console.log(errors)
        )}
        className="space-y-4"
      >
        <TemplateForm children={<>Save template details</>} />
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => {
              router.push(`/email/templates/${template._id}?editor-open=true`);
            }}
            variant="outline"
          >
            Edit Template
          </Button>
        </div>
      </form>
    </Form>
  );
};
