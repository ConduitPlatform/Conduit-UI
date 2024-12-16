'use client';

import { DeclaredSchemas } from '@/lib/models/database';
import { z } from 'zod';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { updateSchema } from '@/lib/api/database';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { Button } from '@/components/ui/button';

export const PermissionsSchema = z.object({
  authorization: z.object({
    enabled: z.boolean(),
  }),
});

export const PermissionsForm = ({ model }: { model?: DeclaredSchemas }) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof PermissionsSchema>>({
    resolver: zodResolver(PermissionsSchema),
    defaultValues: {
      ...model?.modelOptions.conduit?.authorization,
    },
  });
  if (!model) return null;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data => {
          updateSchema(model._id, {
            conduitOptions: data,
          })
            .then(() => {
              toast({
                title: 'Database',
                description:
                  'The schema permission configuration have been updated',
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
            label={'Authorization'}
            fieldName={'authorization.enabled'}
            classNames={{ label: 'text-white' }}
          >
            <span className="text-xs text-muted-foreground">
              Enable authorization for schema {model.name}
            </span>
          </SwitchField>
        </div>
        <Button type="submit" className="flex place-self-end">
          Save
        </Button>
      </form>
    </Form>
  );
};
