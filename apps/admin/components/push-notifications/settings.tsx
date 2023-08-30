'use client';
import { z } from 'zod';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  data?:any
}

const FormSchema = z.object({
  provider: z.string().optional(),
  appId: z.string().optional(),
  apiKey: z.string().optional(),
  projectId: z.string().optional(),
  clientEmail: z.string().optional(),
  privateKey: z.string().optional(),
  file:z.string().optional()
});
export const Settings = ({data}:Props) => {
  const [notificationModule, setNotificationModule] = useState<boolean>(false)
  const [edit ,setEdit] = useState<boolean>(false)
  const { addAlert } = useAlerts();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  const { isDirty, isValid } = form.formState;
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data)
    toast({
      title: 'Notifications',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <CheckIcon className={'w-8 h-8'} />
          <p className='text-sm text-foreground'>Notification Settings Updated!</p>
        </div>
      ),
    });
  };

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">
              Push Notifications
            </p>
            <Switch
              checked={notificationModule}
              onCheckedChange={()=>{addAlert({
                title: 'Push Notification Module',
                description: `Are you sure you want to ${notificationModule ? 'disable' : 'enable'} push notification module?`,
                cancelText: 'Cancel',
                actionText: 'Proceed',
                onDecision: (cancel) => {
                  if (!cancel) {
                    setNotificationModule(!notificationModule);
                  }
                },
              });
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>To see more information regarding the Push Notifications config, visit our <a href={'https://getconduit.dev/docs/modules/push-notifications/config'} className='hover:underline' target={'_blank'}>docs</a>. </p>
          </div>
        </div>
        {notificationModule &&
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className={'flex flex-col gap-4'}>
                  <FormField
                    control={form.control}
                    name='provider'
                    render={({ field }) => (
                      <FormItem className={'w-5/12'} >
                        <FormLabel
                        >Provider name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!edit}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a provider' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={'bg-white dark:bg-popover'}>
                            <SelectItem value={'basic'}>Basic</SelectItem>
                            <SelectItem value={'firebase'}>Firebase</SelectItem>
                            <SelectItem value={'oneSignal'}>OneSignal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              {form.watch('provider') === 'oneSignal' &&
                <div className={'grid grid-cols-2 gap-4'}>
                  <FormField
                    control={form.control}
                    name='appId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          App ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!edit}
                            title={'App Id'}
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
                    name='apiKey'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          API Key
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={!edit}
                            title={'api key'}
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
              {form.watch('provider') === 'firebase' &&
                <>
                  <div className={'grid grid-cols-2 gap-4'}>
                    <FormField
                      control={form.control}
                      name='projectId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Project ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!edit}
                              title={'Project Id'}
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
                      name='clientEmail'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Client Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!edit}
                              title={'client email'}
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
                      name='privateKey'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Private Key
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!edit}
                              title={'private key'}
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
                  <Card className={'flex flex-col  w-fit'}>
                    <CardContent className={'flex  justify-center items-center gap-6 py-6'}>
                      <p className={'font-semibold'}>Or</p>
                      <FormField
                        control={form.control}
                        name='file'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Upload JSON File
                            </FormLabel>
                            <FormControl>
                              <Input
                                type={'file'}
                                accept={'.json'}
                                title={'file upload'}
                                className={'text-accent-foreground'}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </>
              }
              </div>
              <div className={'py-4 flex justify-end'}>
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
        }
      </div>
    </div>
  )
}