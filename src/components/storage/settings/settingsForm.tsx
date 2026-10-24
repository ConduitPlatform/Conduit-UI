import { StorageSettings } from '@/lib/models/storage';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

import { SettingsFormActions } from '@/components/settings/SettingsFormActions';

interface Props {
  control: any;
  edit: boolean;
  isSaving?: boolean;
  setEdit: (arg0: boolean) => void;
  data: StorageSettings;
  authzAvailable: boolean;
  watch: any;
  reset: any;
}

export const SettingsForm = ({
  control,
  edit,
  isSaving = false,
  setEdit,
  watch,
  reset,
  data,
  authzAvailable,
}: Props) => {
  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-x-5'}>
          <FormField
            control={control}
            name="provider"
            render={({ field }) => (
              <FormItem className={'w-3/12'}>
                <FormLabel>Storage Provider</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!edit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={'local'}>Local</SelectItem>
                    <SelectItem value={'aliyun'}>
                      <div className={'flex items-center gap-2'}>
                        Aliyun OSS{' '}
                        {data.aliyun &&
                          data.aliyun.accessKeyId !== '' &&
                          watch('provider') !== 'aliyun' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'aws'}>
                      <div className={'flex items-center gap-2'}>
                        S3{' '}
                        {data.aws &&
                          data.aws.accessKeyId !== '' &&
                          watch('provider') !== 'aws' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'azure'}>
                      <div className={'flex items-center gap-2'}>
                        Azure{' '}
                        {data.azure &&
                          data.azure.connectionString !== '' &&
                          watch('provider') !== 'azure' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'google'}>
                      <div className={'flex items-center gap-2'}>
                        Google{' '}
                        {data.google &&
                          (data.google.serviceAccountKeyPath !== '' ||
                            (data.google.serviceAccountKeyJson ?? '') !== '') &&
                          watch('provider') !== 'google' && <Cog />}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="defaultContainer"
            render={({ field }) => (
              <FormItem className="w-3/12">
                <FormLabel>Default Container</FormLabel>
                <FormControl>
                  <Input
                    disabled={!edit}
                    title={'Default Container'}
                    placeholder={'Enter a value'}
                    className={'text-accent-foreground'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="allowContainerCreation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-3/12">
                <FormLabel className="text-base">
                  Allow Container Creation
                </FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="authorization.enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-3/12">
                <FormLabel className="text-base">Authorization</FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit || (!field.value && !authzAvailable)}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="suffixOnNameConflict"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-3/12">
                <FormLabel className="text-base">
                  Suffix on Name Conflict
                  <p className={'text-xs text-muted-foreground'}>
                    Add suffix to files when there&apos;s a naming conflict
                  </p>
                </FormLabel>
                <FormControl>
                  <Switch
                    disabled={!edit}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className={'grid grid-cols-2 gap-4 items-end'}>
          {watch('provider') === 'local' && (
            <FormField
              control={control}
              name="local.storagePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Path</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      title={'Storage Path'}
                      placeholder={'Enter a value'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {watch('provider') === 'aliyun' && (
            <>
              <FormField
                control={control}
                name="aliyun.region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Region'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aliyun.accessKeyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Key ID</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Access Key ID'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aliyun.accessKeySecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Key Secret</FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!edit}
                        title={'Access Key Secret'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {watch('provider') === 'azure' && (
            <FormField
              control={control}
              name="azure.connectionString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection String</FormLabel>
                  <FormControl>
                    <PasswordInput
                      disabled={!edit}
                      title={'Connection String'}
                      placeholder={'Enter a value'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {watch('provider') === 'google' && (
            <>
              <FormField
                control={control}
                name="google.serviceAccountKeyPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Service Account Key Path
                      <p className={'text-xs text-muted-foreground'}>
                        Path to the service account JSON file. Leave both path
                        and JSON empty to use Application Default Credentials.
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={' Service Account Key Path'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="google.serviceAccountKeyJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Service Account Key JSON
                      <p className={'text-xs text-muted-foreground'}>
                        Inline service account JSON. Do not use if path is
                        provided.
                      </p>
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!edit}
                        title={'Service Account Key JSON'}
                        placeholder={'Enter JSON'}
                        className={'text-accent-foreground'}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {watch('provider') === 'aws' && (
            <>
              <FormField
                control={control}
                name="aws.region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Region'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aws.accessKeyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Key ID*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'accessKeyId'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aws.secretAccessKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Access Key*</FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!edit}
                        title={'secretAccessKey'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aws.accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account ID
                      <p className={'text-xs text-muted-foreground'}>
                        This is used for bucket uniqueness. If not using AWS you
                        can leave empty
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Account ID'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aws.endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Endpoint
                      <p className={'text-xs text-muted-foreground'}>
                        This field should be empty if using AWS S3
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'endpoint'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aws.usePathStyle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel className="text-base">
                      Use Path Style
                      <p className={'text-xs text-muted-foreground'}>
                        Use path style addressing for S3 buckets (only for
                        non-AWS S3 compatible providers)
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Switch
                        disabled={!edit}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
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
