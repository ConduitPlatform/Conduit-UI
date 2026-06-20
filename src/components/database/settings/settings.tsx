'use client';
import { z } from 'zod';
import { DatabaseConfig } from '@/lib/models/database';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver } from '@/lib/zod-form';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/database/settings/settingsForm';
import { patchDatabaseSettings } from '@/lib/api/database';
import { DatabaseSettingsSchema } from '@/components/database/settings/zod';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';

interface Props {
  data: DatabaseConfig;
  databaseType: string;
}

export const Settings = ({ data, databaseType }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const { save, isSaving } = useSettingsSave('Database');
  const form = useForm<z.infer<typeof DatabaseSettingsSchema>>({
    resolver: rhfZodResolver(DatabaseSettingsSchema),
    defaultValues: data,
  });
  const { reset, control, handleSubmit } = form;

  const onSubmit = async (formData: z.infer<typeof DatabaseSettingsSchema>) => {
    const result = await save({
      action: () => patchDatabaseSettings(formData),
    });
    if (result.ok) {
      setEdit(false);
    }
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
              isSaving={isSaving}
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
