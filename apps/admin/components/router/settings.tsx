'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { CaptchaProvider, RouterSettings } from '@/lib/models/Router';
import { patchRouterSettings } from '@/lib/api/router';

const FormSchema = z.object({
  hostUrl: z.string().url(),
  captcha: z.object({
    enabled: z.boolean(),
    provider: z.enum(['recaptcha', 'hcaptcha', 'turnstile']),
    secretKey: z.string(),
  }),
  rateLimit: z.object({
    maxRequests: z.number(),
    resetInterval: z.number(),
  }),
  cors: z.object({
    enabled: z.boolean(),
    origin: z.string(),
    methods: z.string(),
    allowedHeaders: z.string(),
    exposedHeaders: z.string(),
    credentials: z.boolean(),
    maxAge: z.number(),
  }),
  transports: z.object({
    rest: z.boolean(),
    graphql: z.boolean(),
    sockets: z.boolean(),
    proxy: z.boolean(),
  }),
}).refine(schema => {
  if (schema.captcha.enabled && schema.captcha.secretKey === '')
    return false;
  return true;
}, {
  message: 'You need to provide secret key to enable captcha',
  path: ['captcha.secretKey'],
});

interface Props {
  data: RouterSettings;
}

export const Settings = ({ data }: Props) => {
  const [edit, setEdit] = useState<boolean>(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data,
  });

  const { reset, control, handleSubmit, watch } = form;

  const onSubmit = (formData: z.infer<typeof FormSchema>) => {
    setEdit(false);
    const dataToSubmit = {
      ...formData,
      cors: {
        ...formData.cors,
        maxAge: formData.cors.maxAge as number,
      },
    };
    const { id, dismiss } = toast({
      title: 'Router',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Updating Router Settings...</p>
        </div>
      ),
    });
    patchRouterSettings(dataToSubmit).then((res) => {
      dismiss();
      toast({
        title: 'Router',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <CheckIcon className={'w-8 h-8'} />
            <p className='text-sm text-foreground'>Router Settings Updated!</p>
          </div>
        ),
      });
    }).catch((err) => {
      dismiss();
      toast({
        title: 'Router',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className='text-sm'>Failed to update with:</p>
            </div>
            <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
              <code className='text-sm text-foreground'>{err.message}</code>
            </pre>
          </div>
        ),
      });
    });
  };
  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <p className={'text-2xl font-medium'}>General</p>
              <p className={'text-xs text-[#94A3B8] w-9/12'}>Router provides a way for modules to register application
                routes for REST and GraphQL APIs. Endpoint documentation is automatically generated so as to further
                facilitate development. It also provides support for application-level WebSockets. See <a
                  href={'https://getconduit.dev/docs/modules/router/'} className='hover:underline'>more</a>.</p>
            </div>
            <FormField
              control={control}
              name='hostUrl'
              render={({ field }) => (
                <FormItem className={'w-4/12'}>
                  <FormLabel>
                    URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      type={'url'}
                      title={'URL'}
                      placeholder={'Enter url'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={'grid grid-cols-4 gap-4'}>
              <FormField
                control={control}
                name='transports.rest'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-md border px-3 py-2'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>
                        REST
                      </FormLabel>
                      <FormDescription className={'pr-2'}>
                        Note: Disabling REST will affect webhook functionality.
                      </FormDescription>
                    </div>
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
                name='transports.graphql'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-md border px-3 py-2'>
                    <FormLabel className='text-base'>
                      GraphQL
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
                name='transports.sockets'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-md border px-3 py-2'>
                    <FormLabel className='text-base'>
                      WebSockets
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
                name='transports.proxy'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-md border px-3 py-2'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>
                        Proxy
                      </FormLabel>
                      <FormDescription className={'pr-2'}>
                        Allows you to create proxy routes to external services.
                      </FormDescription>
                    </div>
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
            <Separator className={'my-3'} />
            <h1 className='text-2xl font-medium pt-2'>Rate Limit settings</h1>
            <div className={'flex flex-row space-x-4'}>
              <FormField
                control={control}
                name='rateLimit.maxRequests'
                render={({ field }) => (
                  <FormItem className={'w-1/2'}>
                    <FormLabel>
                      Max Requests
                    </FormLabel>
                    <FormDescription className={'pr-2'}>
                      The maximum number of requests allowed within the specified interval.
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'number'}
                        title={'Max Requests'}
                        placeholder={'eg. 50'}
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
                name='rateLimit.resetInterval'
                render={({ field }) => (
                  <FormItem className={'w-1/2'}>
                    <FormLabel>
                      Interval
                    </FormLabel>
                    <FormDescription className={'pr-2'}>
                      The interval in seconds after which the rate limit counter will be reset.
                    </FormDescription>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        type={'number'}
                        title={'Interval'}
                        placeholder={'eg. 1'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className={'my-3'} />
            <FormField
              control={control}
              name='cors.enabled'
              render={({ field }) => (
                <FormItem className='flex items-center gap-4'>
                  <FormLabel className='text-2xl font-medium pt-2'>
                    Cross Origin Resource Sharing
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
            {watch('cors.enabled') && (
              <div className={'grid grid-cols-2 gap-4'}>
                <FormField
                  control={control}
                  name='cors.origin'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Origin
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Origin'}
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
                  name='cors.methods'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Allowed Methods
                        <p className={'text-xs text-[#94A3B8] w-9/12'}>Make sure Methods are comma-separated</p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Allowed Methods'}
                          placeholder={'Enter allowed Methods'}
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
                  name='cors.allowedHeaders'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Allowed Headers
                        <p className={'text-xs text-[#94A3B8] w-9/12'}>Make sure Headers are comma-separated</p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Allowed Headers'}
                          placeholder={'Enter allowed Headers'}
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
                  name='cors.exposedHeaders'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Exposed Headers
                        <p className={'text-xs text-[#94A3B8] w-9/12'}>Make sure Methods are comma-separated</p>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Exposed Headers'}
                          placeholder={'Enter exposed Headers'}
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
                  name='cors.maxAge'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Max Age
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          type={'number'}
                          title={'Max Age'}
                          placeholder={'Max Age'}
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
                  name='cors.credentials'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <FormLabel className='text-base'>
                        Credentials
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
            )}
            <Separator className={'my-3'} />
            <FormField
              control={control}
              name='captcha.enabled'
              render={({ field }) => (
                <FormItem className='flex items-center gap-4'>
                  <FormLabel className='text-2xl font-medium'>
                    Captcha
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
            {watch('captcha.enabled') &&
              <div className={'grid grid-cols-3 gap-4'}>
                <FormField
                  control={control}
                  name='captcha.provider'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={(p: CaptchaProvider) => field.onChange(p)} value={field.value}
                              defaultValue={'recaptcha'} disabled={!edit}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a provider' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={'bg-white dark:bg-popover'}>
                          <SelectItem value={'recaptcha'}>recaptcha</SelectItem>
                          <SelectItem value={'hcaptcha'}>hcaptcha</SelectItem>
                          <SelectItem value={'turnstile'}>turnstile</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='captcha.secretKey'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Secret key
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!edit}
                          title={'Secret key'}
                          placeholder={'Enter a value'}
                          className={'text-accent-foreground'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            }
          </div>
          <div className={'w-full py-4 flex justify-end'}>
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
        </form>
      </Form>
    </div>
  );
};
