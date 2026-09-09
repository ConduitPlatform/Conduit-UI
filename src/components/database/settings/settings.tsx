'use client';
import { z } from 'zod';
import { DatabaseConfig, DatabaseRealtimeStatus } from '@/lib/models/database';
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
  realtimeStatus?: DatabaseRealtimeStatus | null;
}

export const Settings = ({ data, databaseType, realtimeStatus }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const { save, isSaving } = useSettingsSave('Database');
  const form = useForm<z.infer<typeof DatabaseSettingsSchema>>({
    resolver: rhfZodResolver(DatabaseSettingsSchema),
    defaultValues: {
      ...data,
      realtime: { enabled: data.realtime?.enabled ?? false },
    },
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
          <p className="text-2xl font-medium text-balance">Database Settings</p>
          <p className={'text-xs text-muted-foreground'}>
            {databaseType === 'MongoDB'
              ? 'Configure live updates, replica set read preferences, write concern, and read concern.'
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
              realtimeStatus={realtimeStatus}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};
