import { EmailSettings } from '@/lib/models/email';
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
import { Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface Props {
  control: any;
  edit: boolean;
  setEdit: (arg0: boolean) => void;
  data: EmailSettings;
  watch: any;
  reset: any;
}

export const SettingsForm = ({
  control,
  edit,
  setEdit,
  watch,
  reset,
  data,
}: Props) => {
  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-x-5'}>
          <FormField
            control={control}
            name="sendingDomain"
            render={({ field }) => (
              <FormItem className="flex flex-col w-3/12">
                <FormLabel className="text-base">Sending Domain*</FormLabel>
                <FormControl>
                  <Input
                    disabled={!edit}
                    title={'Sending Domain'}
                    placeholder={'mydomain.com'}
                    className={'text-accent-foreground'}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The domain you want to send emails from
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="transport"
            render={({ field }) => (
              <FormItem className={'w-3/12'}>
                <FormLabel>Email Provider</FormLabel>
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
                  <SelectContent className={'bg-white dark:bg-popover'}>
                    <SelectItem value={'smtp'}>SMTP</SelectItem>
                    <SelectItem value={'mailgun'}>
                      <div className={'flex items-center gap-2'}>
                        Mailgun{' '}
                        {data.transportSettings.mailgun &&
                          data.transportSettings.mailgun.apiKey !== '' &&
                          watch('transport') !== 'mailgun' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'mandrill'}>
                      <div className={'flex items-center gap-2'}>
                        Mandrill{' '}
                        {data.transportSettings.mandrill &&
                          data.transportSettings.mandrill.apiKey &&
                          watch('transport') !== 'mandrill' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'sendgrid'}>
                      <div className={'flex items-center gap-2'}>
                        SendGrid{' '}
                        {data.transportSettings.sendgrid &&
                          data.transportSettings.sendgrid.apiKey &&
                          watch('transport') !== 'sendgrid' && <Cog />}
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
          {watch('transport') === 'smtp' && (
            <>
              <FormField
                control={control}
                name="transportSettings.smtp.port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Port*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'number'}
                        title={'SMTP Port'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                        onChange={e => {
                          field.onChange(parseInt(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="transportSettings.smtp.host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'url'}
                        title={'SMTP Host'}
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
                name="transportSettings.smtp.secure"
                render={({ field }) => (
                  <FormItem className={'items-center'}>
                    <FormLabel>HTTPS</FormLabel>
                    <FormControl>
                      <Switch
                        disabled={!edit}
                        title={'HTTPS'}
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
                name="transportSettings.smtp.ignoreTls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ignore TLS Errors</FormLabel>
                    <FormControl>
                      <Switch
                        disabled={!edit}
                        title={'Ignore TLS Errors'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/*auth*/}
              <FormField
                control={control}
                name="transportSettings.smtp.auth.username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>STMP Username</FormLabel>
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
                name="transportSettings.smtp.auth.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>STMP Password</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'password'}
                        title={'STMP Password'}
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
                name="transportSettings.smtp.auth.method"
                render={({ field }) => (
                  <FormItem className={'w-3/12'}>
                    <FormLabel>Auth Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!edit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a login method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={'bg-white dark:bg-popover'}>
                        <SelectItem value={'PLAIN'}>PLAIN</SelectItem>
                        <SelectItem value={'LOGIN'}>LOGIN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {watch('transport') === 'mailgun' && (
            <>
              <FormField
                control={control}
                name="transportSettings.mailgun.apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'password'}
                        title={'API KEY'}
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
                name="transportSettings.mailgun.host"
                render={({ field }) => (
                  <FormItem className={'w-4/12'}>
                    <FormLabel>Mailgun Host (EU or US)*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!edit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mailgun host" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={'bg-white dark:bg-popover'}>
                        <SelectItem value={'api.mailgun.net'}>
                          api.mailgun.net (Global)
                        </SelectItem>
                        <SelectItem value={'api.eu.mailgun.net'}>
                          api.eu.mailgun.net (EU)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="transportSettings.mailgun.proxy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proxy</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'url'}
                        title={'Proxy URL'}
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
          {watch('transport') === 'mandrill' && (
            <FormField
              control={control}
              name="transportSettings.mandrill.apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key*</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      type={'password'}
                      title={'API KEY'}
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
          {watch('transport') === 'sendgrid' && (
            <>
              <FormField
                control={control}
                name="transportSettings.sendgrid.apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'password'}
                        title={'API KEY'}
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
