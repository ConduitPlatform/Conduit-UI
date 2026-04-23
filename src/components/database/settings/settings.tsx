'use client';
import { z } from 'zod';
import { DatabaseConfig } from '@/lib/models/database';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { ErrorPre } from '@/components/ui/error-pre';
import { toast } from '@/lib/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/database/settings/settingsForm';
import { patchDatabaseSettings } from '@/lib/api/database';
import { DatabaseSettingsSchema } from '@/components/database/settings/zod';

interface Props {
  data: DatabaseConfig;
  databaseType: string;
}

export const Settings = ({ data, databaseType }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const form = useForm<z.infer<typeof DatabaseSettingsSchema>>({
    resolver: rhfZodResolver(DatabaseSettingsSchema),
    defaultValues: data,
  });
  const { reset, control, handleSubmit } = form;

  const onSubmit = (data: z.infer<typeof DatabaseSettingsSchema>) => {
    setEdit(false);
    const { dismiss } = toast({
      title: 'Database',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">
            Updating Database Settings...
          </p>
        </div>
      ),
    });

    patchDatabaseSettings(data)
      .then(() => {
        dismiss();
        toast({
          title: 'Database',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">
                Database Settings Updated!
              </p>
            </div>
          ),
        });
      })
      .catch(error => {
        dismiss();
        toast({
          title: 'Database',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to update with:</p>
              </div>
              <ErrorPre>{error.message}</ErrorPre>
            </div>
          ),
        });
      });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <p className="text-2xl font-medium">Database Settings</p>
          <p className={'text-xs text-muted-foreground'}>
            {databaseType === 'MongoDB'
              ? 'Configure MongoDB replica set read preferences, write concern, and read concern levels for your deployment.'
              : 'Database replication settings for your deployment.'}
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SettingsForm
              control={control}
              edit={edit}
              setEdit={setEdit}
              reset={reset}
              databaseType={databaseType}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};
