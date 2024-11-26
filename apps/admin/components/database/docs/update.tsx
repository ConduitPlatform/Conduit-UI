import { useForm } from 'react-hook-form';
import { CodeField } from '@/components/ui/form-inputs/CodeField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import React from 'react';
import { useToast } from '@/lib/hooks/use-toast';

type DocumentUpdateFormProps = React.ComponentProps<typeof CodeField> & {
  row: any;
  model: string;
  cb: (data: any) => void;
};

export const DocumentUpdateForm = ({
  value,
  row,
  model,
  cb,
  ...rest
}: DocumentUpdateFormProps) => {
  const { toast } = useToast();
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
          cb(data);
        })}
      >
        <CodeField {...rest} fieldName={'editedValue'} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
