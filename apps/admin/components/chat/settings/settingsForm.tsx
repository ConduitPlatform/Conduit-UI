import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';

const disabledStyling = 'text-muted-foreground';
interface Props {
  edit: boolean;
  setEdit: (arg0: boolean) => void;
  emailAvailable: boolean;
  pushNotificationsAvailable: boolean;
}

export const SettingsForm = ({
  edit,
  setEdit,
  emailAvailable,
  pushNotificationsAvailable,
}: Props) => {
  const formRef = useFormContext();
  const { reset } = formRef;

  const explicitJoin = useWatch({
    control: formRef.control,
    name: 'explicit_room_joins.enabled',
  });

  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={'grid grid-cols-4 gap-4'}>
          <FormField
            control={formRef.control}
            name="allowMessageDelete"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Messages can be deleted</FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={'text-accent-foreground'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRef.control}
            name="allowMessageEdit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Messages can be edited</FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={'text-accent-foreground'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRef.control}
            name="deleteEmptyRooms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Delete empty Chat rooms</FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={'text-accent-foreground'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRef.control}
            name="auditMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Keep deleted Rooms/Messages for auditing</FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={'text-accent-foreground'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formRef.control}
            name="explicit_room_joins.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Require invite to join room.</FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={'text-accent-foreground'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <>
            <FormField
              control={formRef.control}
              name="explicit_room_joins.send_email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className={cn(!explicitJoin && disabledStyling)}>
                    Send invites via e-mail.
                  </FormLabel>
                  <FormControl>
                    <Switch
                      disabled={
                        !explicitJoin ||
                        !edit ||
                        (!field.value && !emailAvailable)
                      }
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={'text-accent-foreground'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="explicit_room_joins.send_notification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className={cn(!explicitJoin && disabledStyling)}>
                    Send invites via Push Notification.
                  </FormLabel>
                  <FormControl>
                    <Switch
                      disabled={
                        !explicitJoin ||
                        !edit ||
                        (!field.value && !pushNotificationsAvailable)
                      }
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={'text-accent-foreground'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        </div>
      </div>
      <div className={'py-4 flex justify-end'}>
        {edit ? (
          <div className={'flex gap-2'}>
            <Button
              type="button"
              className={'dark:border-gray-500'}
              variant={'outline'}
              onClick={() => {
                reset();
                setEdit(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              setEdit(true);
            }}
          >
            Edit
          </Button>
        )}
      </div>
    </>
  );
};
