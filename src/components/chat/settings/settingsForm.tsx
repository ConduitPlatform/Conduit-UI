import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';

const disabledStyling = 'text-muted-foreground';
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';

interface Props {
  edit: boolean;
  isSaving?: boolean;
  setEdit: (arg0: boolean) => void;
  emailAvailable: boolean;
  pushNotificationsAvailable: boolean;
}

export const SettingsForm = ({
  edit,
  isSaving = false,
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
        <div className="flex flex-col gap-4 border-t pt-4">
          <h3
            className={cn(
              'text-lg font-medium',
              !explicitJoin && disabledStyling
            )}
          >
            Invitation Redirects
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={formRef.control}
              name="explicit_room_joins.redirect.login_uri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(!explicitJoin && disabledStyling)}>
                    Login Redirect URI
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!explicitJoin || !edit}
                      placeholder="https://example.com/login"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription
                    className={cn(!explicitJoin && disabledStyling)}
                  >
                    Absolute login page URL for unauthenticated email-link
                    clicks. Hook appends
                    ?redirectUri=...&answer=...&invitationToken=... Empty means
                    email clicks fail until configured.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="explicit_room_joins.redirect.accept_uri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(!explicitJoin && disabledStyling)}>
                    Accept Redirect URI
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!explicitJoin || !edit}
                      placeholder="https://example.com/chat/{roomId}"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription
                    className={cn(!explicitJoin && disabledStyling)}
                  >
                    Post-accept destination. Supports {'{roomId}'} placeholder.
                    If empty, returns a JSON result.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="explicit_room_joins.redirect.decline_uri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(!explicitJoin && disabledStyling)}>
                    Decline Redirect URI
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!explicitJoin || !edit}
                      placeholder="https://example.com/dashboard"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription
                    className={cn(!explicitJoin && disabledStyling)}
                  >
                    Post-decline destination. Supports {'{roomId}'} placeholder.
                    If empty, returns a JSON result.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
