'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import SelectField from '@/components/ui/form-inputs/SelectField';
import { Button } from '@/components/ui/button';
import { updateSchema } from '@/lib/api/database';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import { DeclaredSchemas } from '@/lib/models/database';

export const ExtensionSchema = z.object({
  extendable: z.boolean(),
  canCreate: z.boolean(),
  canModify: z.enum(['Everything', 'Nothing', 'ExtensionOnly']),
  canDelete: z.boolean(),
});

export const ExtensionsForm = ({ model }: { model?: DeclaredSchemas }) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof ExtensionSchema>>({
    resolver: zodResolver(ExtensionSchema),
    defaultValues: {
      ...model?.modelOptions.conduit.permissions,
    },
  });
  if (!model) return null;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data => {
          updateSchema(model._id, {
            conduitOptions: { permissions: data },
          })
            .then(() => {
              toast({
                title: 'Database',
                description:
                  'The schema extension configuration have been updated',
              });
              router.refresh();
            })
            .catch(err =>
              toast({
                title: 'Database',
                description: err.message,
              })
            );
        })}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 w-full space-y-2 py-1">
          <SwitchField
            label={'Extendable'}
            fieldName={'extendable'}
            classNames={{ label: 'text-white' }}
          >
            <span className="text-xs text-muted-foreground">
              Allows the model to be extended by modules
            </span>
          </SwitchField>
          <SwitchField
            label={'Create'}
            fieldName={'canCreate'}
            classNames={{ label: 'text-white' }}
          >
            <span className="text-xs text-muted-foreground">
              Allows the creation of model entries by extension models
            </span>
          </SwitchField>
          <SwitchField
            label={'Delete'}
            fieldName={'canDelete'}
            classNames={{ label: 'text-white' }}
          >
            <span className="text-xs text-muted-foreground">
              Allows the deletion of model entries by extension models
            </span>
          </SwitchField>
          <SelectField
            fieldName={'canModify'}
            label="Modify"
            classNames={{
              description: 'text-xs text-muted-foreground',
            }}
            description="Allows the modification of target model entry fields by extension schemas"
            options={[
              { label: 'Everything', value: 'Everything' },
              { label: 'Nothing', value: 'Nothing' },
              { label: 'Extension Only', value: 'ExtensionOnly' },
            ]}
          />
        </div>
        <Button type="submit" className="flex place-self-end">
          Save
        </Button>
      </form>
    </Form>
  );
};
