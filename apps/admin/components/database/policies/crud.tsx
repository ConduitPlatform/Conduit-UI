'use client';

import { z } from 'zod';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeclaredSchemas } from '@/lib/models/database';
import { updateSchema } from '@/lib/api/database';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

export const CrudSchema = z.object({
  enabled: z.boolean(),
  crudOperations: z.object({
    create: z.object({
      enabled: z.boolean(),
      authenticated: z.boolean(),
    }),
    read: z.object({
      enabled: z.boolean(),
      authenticated: z.boolean(),
    }),
    update: z.object({
      enabled: z.boolean(),
      authenticated: z.boolean(),
    }),
    delete: z.object({
      enabled: z.boolean(),
      authenticated: z.boolean(),
    }),
  }),
});

export const CrudForm = ({ model }: { model?: DeclaredSchemas }) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof CrudSchema>>({
    resolver: zodResolver(CrudSchema),
    defaultValues: {
      ...model?.modelOptions.conduit?.cms,
    },
  });
  if (!model) return null;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data => {
          updateSchema(model._id, {
            conduitOptions: {
              cms: data,
            },
          })
            .then(() => {
              toast({
                title: 'Database',
                description: 'The schema crud configuration have been updated',
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
      >
        <SwitchField
          label={'Enable'}
          fieldName={'crudOperations.enabled'}
          classNames={{ label: 'text-white' }}
          className="mt-2"
        >
          <span className="text-xs text-muted-foreground">
            Enable crud operation
          </span>
        </SwitchField>
        <div className="grid grid-cols-2 w-full space-y-2">
          <div className="flex flex-col">
            <SwitchField
              label={'Create'}
              fieldName={'crudOperations.create.enabled'}
              classNames={{ label: 'text-white' }}
            >
              <span className="text-xs text-muted-foreground">
                Generate create crud operation
              </span>
            </SwitchField>
            <SwitchField
              label={'Authentication'}
              fieldName={'crudOperations.create.authenticated'}
              classNames={{ label: 'text-white' }}
              className="ml-4"
            />
          </div>
          <div className="flex flex-col">
            <SwitchField
              label={'Read'}
              fieldName={'crudOperations.read.enabled'}
              classNames={{ label: 'text-white' }}
            >
              <span className="text-xs text-muted-foreground">
                Generate read crud operation
              </span>
            </SwitchField>
            <SwitchField
              label={'Authentication'}
              fieldName={'crudOperations.read.authenticated'}
              classNames={{ label: 'text-white' }}
              className="ml-4"
            />
          </div>
          <div className="flex flex-col">
            <SwitchField
              label={'Update'}
              fieldName={'crudOperations.update.enabled'}
              classNames={{ label: 'text-white' }}
            >
              <span className="text-xs text-muted-foreground">
                Generate update crud operation
              </span>
            </SwitchField>
            <SwitchField
              label={'Authentication'}
              fieldName={'crudOperations.update.authenticated'}
              classNames={{ label: 'text-white' }}
              className="ml-4"
            />
          </div>
          <div className="flex flex-col">
            <SwitchField
              label={'Delete'}
              fieldName={'crudOperations.delete.enabled'}
              classNames={{ label: 'text-white' }}
            >
              <span className="text-xs text-muted-foreground">
                Generate delete crud operation for schema {model.name}
              </span>
            </SwitchField>
            <SwitchField
              label={'Authentication'}
              fieldName={'crudOperations.delete.authenticated'}
              classNames={{ label: 'text-white' }}
              className="ml-4"
            />
          </div>
        </div>
        <Button type="submit" className="flex place-self-end mt-5">
          Save
        </Button>
      </form>
    </Form>
  );
};
