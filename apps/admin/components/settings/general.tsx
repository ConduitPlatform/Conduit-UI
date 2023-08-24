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

const FormSchema = z.object({
  general: z.string().optional(),
  url: z.string().optional(),
  rest: z.boolean().optional(),
  graphQl: z.boolean().optional(),
  webSocket: z.boolean().optional(),
  hashRounds: z.string().optional(),
  expiration: z.string().optional(),
  secret: z.string().optional(),
  cors: z.boolean().optional(),
  origin:z.string().optional(),
  methods: z.string().optional(),
  headers: z.string().optional(),
  exposedHeaders : z.string().optional(),
  credentials: z.boolean().optional(),
  maxAge :z.string().optional(),
});
export const General = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
    },
  });

  const { isDirty, isValid } = form.formState;

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data)
  };
  return (
    <div className={'container mx-auto py-10'}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-3'}>
            <p className={'text-xl'}>General</p>
              <FormField
                control={form.control}
                name='general'
                render={({ field }) => (
                  <FormItem >
                    <FormLabel
                      >Environment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'development'}>Development</SelectItem>
                        <SelectItem value={'production'}>Production</SelectItem>
                        <SelectItem value={'test'}>Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Separator/>
            <div>
              <p className={'text-xl'}>Administrative Routing</p>
              <p className={'text-xs text-[#94A3B8]'}>For specifics about different kinds of administrative routes, visit <a href={'https://getconduit.dev/docs/administration/rest'} className='hover:underline' target={'_blank'}>REST</a>, <a href={'https://getconduit.dev/docs/administration/graphql'} className='hover:underline' target={'_blank'}>GRAPHQL</a>, <a href={'https://getconduit.dev/docs/administration/sockets'} className='hover:underline' target={'_blank'}>WEBSOCKETS</a>. To see more information regarding the Administrative APIs, please visit our <a href={'https://getconduit.dev/docs/administration/'} className='hover:underline'>docs</a>.</p>
            </div>
            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel>
                    URL
                  </FormLabel>
                  <FormControl>
                    <Input
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
            <FormField
              control={form.control}
              name="rest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      REST
                    </FormLabel>
                    <FormDescription>
                      Conduit&apos;s administrative REST API may not be disabled via the Admin Panel at this time
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel className="text-base">
                      GraphQL
                    </FormLabel>
                  <FormControl>
                    <Switch
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel className="text-base">
                      WebSockets
                    </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <p className={'text-lg'}>Administrative Settings</p>
            <FormField
              control={form.control}
              name='hashRounds'
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel>
                    Hash Rounds
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={'number'}
                      title={'Hash Rounds'}
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
              name='expiration'
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel>
                    Token Expiration Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={'number'}
                      title={'Token Expiration Time'}
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
              name='secret'
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel>
                    Token Secret
                  </FormLabel>
                  <FormControl>
                    <Input
                      title={'Token Secret'}
                      placeholder={'Enter token secret'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator/>
            <FormField
              control={form.control}
              name="cors"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel className="text-base">
                    CORS
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('cors') && (
              <>
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
                  name="credentials"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base">
                        Credentials
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='maxAge'
                  render={({ field }) => (
                    <FormItem className={'w-full'}>
                      <FormLabel>
                        Exposed Headers
                      </FormLabel>
                      <FormControl>
                        <Input
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
              </>
            )}
          </div>
          <div className={'w-full p-4 flex justify-end'}>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}