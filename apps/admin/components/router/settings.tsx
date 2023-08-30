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
import { CheckIcon } from 'lucide-react';

const FormSchema = z.object({
  url: z.string().optional(),
  rest: z.boolean().optional(),
  graphQl: z.boolean().optional(),
  webSocket: z.boolean().optional(),
  cors: z.boolean().optional(),
  origin:z.string().optional(),
  methods: z.string().optional(),
  headers: z.string().optional(),
  exposedHeaders : z.string().optional(),
  credentials: z.boolean().optional(),
  maxAge :z.string().optional(),
  captcha:z.boolean().optional(),
  provider:z.string().optional(),
  secret: z.string().optional()
});

interface Props {
  data: any
}
export const Settings = ({data}:Props) => {
  const [edit, setEdit] = useState<boolean>(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rest:true,
      cors:false,
      captcha:false,
    },
  });

  const { isDirty, isValid } = form.formState;

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data)
    toast({
      title: 'Router',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <CheckIcon className={'w-8 h-8'} />
          <p className='text-sm text-foreground'>Router Settings Updated!</p>
        </div>
      ),
    });
    setEdit(false)
  };
  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <p className={'text-2xl font-medium'}>General</p>
              <p className={'text-xs text-[#94A3B8] w-9/12'}>Router provides a way for modules to register application routes for REST and GraphQL APIs. Endpoint documentation is automatically generated so as to further facilitate development. It also provides support for application-level WebSockets. See <a href={'https://getconduit.dev/docs/modules/router/'} className='hover:underline'>more</a>.</p>
            </div>
              <FormField
              control={form.control}
              name='url'
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
            <div className={'grid grid-cols-3 gap-4'}>
              <FormField
                control={form.control}
                name="rest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        REST
                      </FormLabel>
                      <FormDescription className={'pr-2'}>
                        Conduit&apos;s administrative REST API may not be disabled via the Admin Panel at this time
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        disabled={true}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graphQl"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="text-base">
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
                control={form.control}
                name="webSocket"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-2">
                    <FormLabel className="text-base">
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
            </div>
            <FormField
              control={form.control}
              name="cors"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="text-2xl font-medium pt-2">
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
            {form.watch('cors') && (
              <div className={'grid grid-cols-2 gap-4'}>
                <FormField
                  control={form.control}
                  name='origin'
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
                  control={form.control}
                  name='methods'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Allowed Methods
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
                  control={form.control}
                  name='headers'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Allowed Headers
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
                  control={form.control}
                  name='exposedHeaders'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Exposed Headers
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
                  control={form.control}
                  name='maxAge'
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
                  control={form.control}
                  name="credentials"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">
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
            <Separator className={'my-3'}/>
            <FormField
              control={form.control}
              name="captcha"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel className="text-2xl font-medium">
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
            {form.watch('captcha') &&
            <div className={'grid grid-cols-3 gap-4'}>
              <FormField
                control={form.control}
                name='provider'
                render={({ field }) => (
                  <FormItem >
                    <FormLabel
                    >Provider</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!edit} >
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
                control={form.control}
                name='secret'
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
                  onClick={()=>
                  {
                    form.reset();
                    setEdit(false);
                  }
                  }>Cancel</Button>
                <Button type="submit">Submit</Button>
              </div>:
              <Button onClick={()=>{setEdit(true)}} >Edit</Button>
            }
          </div>
        </form>
      </Form>
    </div>
  );
}