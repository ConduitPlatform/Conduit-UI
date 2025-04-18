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
import { ChevronDown, Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import * as React from 'react';

interface Props {
  edit: boolean;
  setEdit: (arg0: boolean) => void;
  data: EmailSettings;
}

export const SettingsForm = ({ edit, setEdit, data }: Props) => {
  const form = useFormContext();
  return (
    <>
      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-row gap-x-5'}>
          <FormField
            control={form.control}
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
            control={form.control}
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
                          form.watch('transport') !== 'mailgun' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'mandrill'}>
                      <div className={'flex items-center gap-2'}>
                        Mandrill{' '}
                        {data.transportSettings.mandrill &&
                          data.transportSettings.mandrill.apiKey &&
                          form.watch('transport') !== 'mandrill' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'sendgrid'}>
                      <div className={'flex items-center gap-2'}>
                        SendGrid{' '}
                        {data.transportSettings.sendgrid &&
                          data.transportSettings.sendgrid.apiKey &&
                          form.watch('transport') !== 'sendgrid' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'mailersend'}>
                      <div className={'flex items-center gap-2'}>
                        MailerSend{' '}
                        {data.transportSettings.mailersend &&
                          data.transportSettings.mailersend.apiKey &&
                          form.watch('transport') !== 'mailersend' && <Cog />}
                      </div>
                    </SelectItem>
                    <SelectItem value={'amazonSes'}>
                      <div className={'flex items-center gap-2'}>
                        Amazon SES{' '}
                        {data.transportSettings.amazonSes &&
                          data.transportSettings.amazonSes.accessKeyId &&
                          form.watch('transport') !== 'amazonSes' && <Cog />}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Collapsible
          key={`access-tokens`}
          className="border rounded-md overflow-hidden mb-4"
        >
          <div className="flex items-center justify-between p-3 bg-muted/30">
            <div className="flex items-center space-x-2 flex-grow">
              <CollapsibleTrigger className="flex items-center space-x-2 flex-grow text-left">
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform ui-open:rotate-180" />
                <span className="font-medium truncate text-xl">
                  Email Storage
                </span>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className={'p-4'}>
            <div className={'flex flex-col space-y-4 '}>
              <div className={'flex flex-row space-x-4'}>
                <SwitchField
                  label={'Store Emails'}
                  fieldName={'storeEmails.enabled'}
                  disabled={!edit}
                />
              </div>
              <span>
                By default emails are stored only in the Database. For larger
                emails it&apos;s recommended to use blob storage
              </span>
              <div className={'flex flex-row space-x-4 items-center'}>
                <SwitchField
                  label={'Store in Blob Storage'}
                  fieldName={'storeEmails.storage.enabled'}
                  disabled={!edit}
                />
                {form.watch('storeEmails.storage.enabled') && (
                  <div className={'grid grid-cols-2 gap-4 items-center'}>
                    <InputField
                      label={'Container'}
                      fieldName={'storeEmails.storage.container'}
                      disabled={!edit}
                    />
                    <InputField
                      label={'Folder'}
                      fieldName={'storeEmails.storage.folder'}
                      disabled={!edit}
                    />
                  </div>
                )}
              </div>
              <span>Setup old email cleanup:</span>
              <div className={'flex flex-row space-x-4 items-center'}>
                <SwitchField
                  label={'Enable cleanup'}
                  fieldName={'storeEmails.cleanupSettings.enabled'}
                  disabled={!edit}
                />
                {form.watch('storeEmails.cleanupSettings.enabled') && (
                  <div className={'grid grid-cols-2 gap-4 items-center'}>
                    <InputField
                      label={'Cleanup interval (ms)'}
                      type={'number'}
                      fieldName={'storeEmails.cleanupSettings.repeat'}
                      disabled={!edit}
                    />
                    <InputField
                      label={'Deletion limit per run'}
                      type={'number'}
                      fieldName={'storeEmails.cleanupSettings.limit'}
                      disabled={!edit}
                    />
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className={'grid grid-cols-2 gap-4'}>
          {form.watch('transport') === 'smtp' && (
            <>
              <FormField
                control={form.control}
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
                control={form.control}
                name="transportSettings.smtp.host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'text'}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
          {form.watch('transport') === 'mailgun' && (
            <>
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
          {form.watch('transport') === 'mandrill' && (
            <FormField
              control={form.control}
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
          {form.watch('transport') === 'sendgrid' && (
            <>
              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
                name="transportSettings.sendgrid.residency"
                render={({ field }) => (
                  <FormItem className={'w-4/12'}>
                    <FormLabel>Sendgrid Host (EU or US)*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!edit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sendgrid host" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={'bg-white dark:bg-popover'}>
                        <SelectItem value={'global'}>
                          https://api.sendgrid.com (Global)
                        </SelectItem>
                        <SelectItem value={'eu'}>
                          https://api.eu.sendgrid.com (EU)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {form.watch('transport') === 'mailersend' && (
            <>
              <FormField
                control={form.control}
                name="transportSettings.mailersend.apiKey"
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
                control={form.control}
                name="transportSettings.mailersend.host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MailerSend SMTP Host*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'text'}
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
                control={form.control}
                name="transportSettings.mailersend.port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MailerSend SMTP Port*</FormLabel>
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
            </>
          )}
          {form.watch('transport') === 'amazonSes' && (
            <>
              <FormField
                control={form.control}
                name="transportSettings.amazonSes.region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'text'}
                        title={'Region'}
                        placeholder={'ex. us-east-1'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transportSettings.amazonSes.accessKeyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Key ID*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'text'}
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
                control={form.control}
                name="transportSettings.amazonSes.secretAccessKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Access Key*</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'password'}
                        title={'Secret Access Key'}
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
                form.reset();
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
