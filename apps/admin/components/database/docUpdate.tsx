'use client';

import { useForm } from 'react-hook-form';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import React from 'react';
import { updateSchemaDocument } from '@/lib/api/database';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

type DocumentUpdateFormProps = React.ComponentProps<typeof CodeField> & {
  row: any;
  model: string;
};

export const DocumentUpdateForm = ({
  value,
  row,
  fieldName,
  model,
  ...rest
}: DocumentUpdateFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      editedValue: value,
    },
  });
  return (
    <Form {...form}>
      <form
        className="space-y-4 h-96 overflow-scroll"
        onSubmit={form.handleSubmit(data => {
          if (!data.editedValue) {
            toast({
              title: 'Database',
              description: 'Please enter a value to update the document',
            });
            return;
          }
          try {
            updateSchemaDocument(model, row.original._id, {
              ...row.original,
              [fieldName]: JSON.parse(data.editedValue as string),
            }).then(() => {
              toast({
                title: 'Database',
                description: 'Document has been updated successfully',
              });
              router.refresh();
            });
          } catch (e) {
            toast({
              title: 'Database',
              description: (e as Error).message,
            });
            return;
          }
        })}
      >
        <CodeField fieldName={'editedValue'} {...rest} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
