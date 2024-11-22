'use client';

import { useForm } from 'react-hook-form';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import React from 'react';
import { updateSchemaDocument } from '@/lib/api/database';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

export const DocumentUpdateForm = ({
  value,
  row,
  fieldName,
  model,
}: {
  value: any;
  row: any;
  fieldName: string;
  model: string;
}) => {
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
        className="space-y-4"
        onSubmit={form.handleSubmit(data => {
          updateSchemaDocument(model, row.original._id, {
            ...row.original,
            [fieldName]: JSON.parse(data.editedValue),
          }).then(() => {
            toast({
              title: 'Database',
              description: 'Document has been updated successfully',
            });
            router.refresh();
          });
        })}
      >
        <CodeField
          label={''}
          fieldName={'editedValue'}
          placeholder={'{"key": "value"}'}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
