import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SmsSettings } from '@/lib/models/Sms';
import { Switch } from '@/components/ui/switch';

interface Props {
  control: any;
  edit: boolean;
  setEdit: (arg0: boolean) => void;
  data: SmsSettings;
  watch: any;
  reset: any;
}

export const SettingsForm = ({ control, edit, setEdit, watch, reset, data }: Props) => {
  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-x-5'}>
          <FormField
            control={control}
            name='providerName'
            render={({ field }) => (
              <FormItem className={'w-3/12'}>
                <FormLabel>SMS Provider</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!edit}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a provider' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={'bg-white dark:bg-popover'}>
                    <SelectItem value={'twilio'}>
                      <div className={'flex items-center gap-2'}>
                        Twilio {data.twilio && data.twilio.accountSID !== '' && watch('providerName') !== 'twilio' &&
                        <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'awsSns'}>
                      <div className={'flex items-center gap-2'}>
                        AWS SNS{data.awsSns && data.awsSns.accessKeyId !== '' && watch('provider') !== 'awsSns' &&
                        <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'messageBird'}>
                      <div className={'flex items-center gap-2'}>
                        MessageBird {data.messageBird && data.messageBird.accessKeyId !== '' && watch('provider') !== 'messageBird' &&
                        <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'clickSend'}>
                      <div className={'flex items-center gap-2'}>
                        ClickSend {data.clickSend && data.clickSend.clicksendApiKey !== '' && watch('provider') !== 'clickSend' &&
                        <Cog />}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className={'grid grid-cols-2 gap-4'}>
          {watch('providerName') === 'twilio' &&
            <>
              <FormField
                control={control}
                name='twilio.phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'tel'}
                        title={'Phone Number'}
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
                name='twilio.accountSID'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account SID
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Account SID'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> <FormField
              control={control}
              name='twilio.authToken'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Authentication Token
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      type={'password'}
                      title={'Authentication Token'}
                      placeholder={'Enter a value'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> <FormField
              control={control}
              name='twilio.verify.active'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 w-4/12'>
                  <FormLabel>
                    Verification Module
                  </FormLabel>
                  <FormControl>
                    <Switch
                      disabled={!edit}
                      title={'Active'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> <FormField
              control={control}
              name='twilio.verify.serviceSid'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Verification Module SID
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      title={'Verify SID'}
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
          {watch('providerName') === 'awsSns' &&
            <>
              <FormField
                control={control}
                name='awsSns.region'
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
                name='awsSns.accessKeyId'
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
                name='awsSns.secretAccessKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Access Key Secret
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'password'}
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
          }
          {watch('providerName') === 'messageBird' &&
            <>
              <FormField
                control={control}
                name='messageBird.accessKeyId'
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
                name='messageBird.originatorName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Originator Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Originator Name'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </>
          }
          {watch('providerName') === 'clickSend' &&
            <>
              <FormField
                control={control}
                name='clickSend.username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      API Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Username'}
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
                name='clickSend.clicksendApiKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      API Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'password'}
                        title={'API Key'}
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
