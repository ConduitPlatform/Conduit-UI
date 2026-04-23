import { Settings } from '@/components/database/settings/settings';
import { getDatabaseSettings, getDatabaseType } from '@/lib/api/database';

export default async function DatabaseSettingsPage() {
  const [settingsResult, typeResult] = await Promise.allSettled([
    getDatabaseSettings(),
    getDatabaseType(),
  ]);

  const databaseType =
    typeResult.status === 'fulfilled' ? typeResult.value.result : 'Unknown';

  if (settingsResult.status === 'rejected') {
    return (
      <div className={'container mx-auto py-10'}>
        <div className={'flex flex-col gap-6'}>
          <p className="text-2xl font-medium">Database Settings</p>
          <p className="text-sm text-muted-foreground">
            Database settings are not available. This feature requires a
            compatible backend version.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Settings data={settingsResult.value.config} databaseType={databaseType} />
  );
}
