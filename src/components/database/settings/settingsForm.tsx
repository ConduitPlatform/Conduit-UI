import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';
import type { DatabaseRealtimeStatus } from '@/lib/models/database';

interface Props {
  control: any;
  edit: boolean;
  isSaving?: boolean;
  setEdit: (arg0: boolean) => void;
  reset: any;
  databaseType: string;
  realtimeStatus?: DatabaseRealtimeStatus | null;
}

function realtimeStatusCopy(status: DatabaseRealtimeStatus | null | undefined) {
  if (!status) {
    return 'Runtime status is unavailable for this backend.';
  }
  switch (status.status) {
    case 'live':
      return `Live · ${status.activeSchemaCount} opted-in ${
        status.activeSchemaCount === 1 ? 'schema' : 'schemas'
      }`;
    case 'starting':
      return 'Starting the change-stream listener.';
    case 'idle':
      return (
        status.message ??
        'Waiting for a replica set and at least one opted-in schema.'
      );
    case 'disabled':
      return 'Live updates are turned off for this module.';
    case 'degraded':
      return status.message ?? 'The change-stream listener is degraded.';
    case 'unsupported':
      return status.message ?? 'Live updates require MongoDB.';
    default: {
      const _exhaustive: never = status.status;
      return _exhaustive;
    }
  }
}

export const SettingsForm = ({
  control,
  edit,
  isSaving = false,
  setEdit,
  reset,
  databaseType,
  realtimeStatus,
}: Props) => {
  if (databaseType !== 'MongoDB') {
    return (
      <Alert>
        <AlertDescription>
          Live updates and replica set read preferences are only available for
          MongoDB deployments. Your current database type is{' '}
          <span className="font-medium">{databaseType}</span>.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className={'flex flex-col gap-6'}>
        <FormField
          control={control}
          name="realtime.enabled"
          render={({ field }) => (
            <FormItem className="flex min-h-16 flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-1 pr-4">
                <FormLabel htmlFor="realtime-enabled" className="text-base">
                  Live updates
                </FormLabel>
                <FormDescription>
                  Watch opted-in schemas through MongoDB change streams. Schemas
                  must also enable live updates. Data Explorer never
                  auto-refreshes.
                </FormDescription>
                <p className="text-xs text-muted-foreground">
                  {realtimeStatusCopy(realtimeStatus)}
                </p>
              </div>
              <FormControl>
                <Switch
                  id="realtime-enabled"
                  disabled={!edit}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={'grid grid-cols-3 gap-4'}>
          <FormField
            control={control}
            name="readPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read Preference</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!edit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select read preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primary">primary</SelectItem>
                    <SelectItem value="primaryPreferred">
                      primaryPreferred
                    </SelectItem>
                    <SelectItem value="secondary">secondary</SelectItem>
                    <SelectItem value="secondaryPreferred">
                      secondaryPreferred
                    </SelectItem>
                    <SelectItem value="nearest">nearest</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls which replica set members receive read queries. Use
                  &apos;secondaryPreferred&apos; to distribute reads across
                  replicas while falling back to primary when no secondaries are
                  available. Modules can override this per-query when they need
                  read-after-write consistency.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="writeConcern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Write Concern</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!edit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select write concern" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="majority">majority</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Determines how many replica set members must acknowledge a
                  write before it&apos;s considered successful.
                  &apos;majority&apos; ensures writes survive replica set
                  elections and is recommended for production. &apos;1&apos;
                  only waits for the primary and is faster but risks data loss
                  during failover.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="readConcern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read Concern</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!edit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select read concern" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="local">local</SelectItem>
                    <SelectItem value="available">available</SelectItem>
                    <SelectItem value="majority">majority</SelectItem>
                    <SelectItem value="linearizable">linearizable</SelectItem>
                    <SelectItem value="snapshot">snapshot</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls the consistency and isolation of read operations.
                  &apos;local&apos; returns the most recent data on the queried
                  node. &apos;majority&apos; only returns data confirmed by a
                  majority of replicas, guaranteeing it won&apos;t be rolled
                  back.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <SettingsFormActions
        edit={edit}
        isSaving={isSaving}
        onEdit={() => setEdit(true)}
        onCancel={() => {
          reset();
          setEdit(false);
        }}
      />
    </>
  );
};
