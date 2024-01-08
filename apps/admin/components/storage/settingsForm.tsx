import { StorageSettings } from '@/lib/models/Storage';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
  control: any;
  edit: boolean;
  setEdit: (arg0: boolean) => void;
  data: StorageSettings;
  authzAvailable: boolean;
  watch: any;
  reset: any;
}

export const SettingsForm = ({ control, edit, setEdit, watch, reset, data, authzAvailable }: Props) => {
  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-x-5'}>
          <FormField
            control={control}
            name='provider'
            render={({ field }) => (
              <FormItem className={'w-3/12'}>
                <FormLabel>Storage Provider</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!edit}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a provider' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={'bg-white dark:bg-popover'}>
                    <SelectItem value={'local'}>Local</SelectItem>
                    <SelectItem value={'aliyun'}>
                      <div className={'flex items-center gap-2'}>
                        Aliyun OSS {data.aliyun && data.aliyun.accessKeyId !== '' && watch('provider') !== 'aliyun' &&
                        <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'aws'}>
                      <div className={'flex items-center gap-2'}>
                        AWS {data.aws && data.aws.accessKeyId !== '' && watch('provider') !== 'aws' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'azure'}>
                      <div className={'flex items-center gap-2'}>
                        Azure {data.azure && data.azure.connectionString !== '' && watch('provider') !== 'azure' &&
                        <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'google'}>
                      <div className={'flex items-center gap-2'}>
                        Google {data.google && data.google.serviceAccountKeyPath !== '' && watch('provider') !== 'google' &&
                        <Cog />}
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
            name='defaultContainer'
            render={({ field }) => (
              <FormItem className='w-3/12'>
                <FormLabel>
                  Default Container
                </FormLabel>
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
            name='allowContainerCreation'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 w-3/12'>
                <FormLabel className='text-base'>
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
            name='authorization.enabled'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 w-3/12'>
                <FormLabel className='text-base'>
                  Authorization
                </FormLabel>
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
        </div>
        <div className={'grid grid-cols-2 gap-4'}>
          {watch('provider') === 'local' &&
            <FormField
              control={control}
              name='local.storagePath'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Storage Path
                  </FormLabel>
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
          }
          {watch('provider') === 'aliyun' &&
            <>
              <FormField
                control={control}
                name='aliyun.region'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Region
                    </FormLabel>
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
                name='aliyun.accessKeyId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Access Key ID
                    </FormLabel>
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
                name='aliyun.accessKeySecret'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Access Key Secret
                    </FormLabel>
                    <FormControl>
                      <Input
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
          }{
          watch('provider') === 'azure' &&
          <FormField
            control={control}
            name='azure.connectionString'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Connection String
                </FormLabel>
                <FormControl>
                  <Input
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
        }
          {watch('provider') === 'google' &&
            <>
              <FormField
                control={control}
                name='google.serviceAccountKeyPath'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Service Account Key Path
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={' Service Account Key Path'}
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
          }
          {
            watch('provider') === 'aws' &&
            <>
              <FormField
                control={control}
                name='aws.region'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Region
                    </FormLabel>
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
                name='aws.accessKeyId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Access Key ID
                    </FormLabel>
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
                name='aws.secretAccessKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Secret Access Key
                    </FormLabel>
                    <FormControl>
                      <Input
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
                name='aws.accountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account ID
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
                name='aws.endpoint'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Endpoint
                      <p className={'text-xs text-[#94A3B8]'}>
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
            </>
          }
        </div>
      </div>
      <div className={'py-4 flex justify-end'}>
        {edit ?
          <div className={'flex gap-2'}>
            <Button
              type='button'
              className={'dark:border-gray-500'}
              variant={'outline'}
              onClick={() => {
                reset();
                setEdit(false);
              }}>Cancel</Button>
            <Button type='submit'>Submit</Button>
          </div> :
          <Button onClick={() => {
            setEdit(true);
          }}>Edit</Button>
        }
      </div>
    </>
  );
};
