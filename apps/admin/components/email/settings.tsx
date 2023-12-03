'use client';
import {
  EmailSettings, TransportProviders,
} from '@/lib/models/Email';
import { useEffect, useState } from 'react';
import { useAlerts } from '@/components/providers/AlertProvider';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { Module } from '@/lib/models/Module';
import { patchEmailSettings } from '@/lib/api/email';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/email/settingsForm';
import { isEmpty } from 'lodash';

interface Props {
  data: EmailSettings
}

const FormSchema = z.object({
  active: z.boolean(),
  sendingDomain: z.string({
    required_error: "You need to provide the Sending Domain",
  }),
  transport: z.union([z.literal("mailgun"), z.literal("smtp"),z.literal("mandrill"),z.literal("sendgrid"),]),
  transportSettings:  z.object({
    mailgun: z.object({
      apiKey: z.string(),
      domain: z.string(),
      host: z.string(),
      proxy: z.string(),
    }),
    smtp: z.object({
      port: z.string(),
      host: z.string(),
      secure: z.boolean(),
      ignoreTls: z.boolean(),
      auth: z.object({
        username: z.string(),
        password: z.string(),
        method: z.string(),
      }),
    }),
    mandrill: z.object({
      apiKey: z.string(),
    }),
    sendgrid: z.object({
      apiKey: z.string(),
    }),
  }),
}).refine(schema => {
  if (schema.transport === 'mailgun' && (!isEmpty(schema.transportSettings.mailgun)))
    return false;
  if (schema.transport === 'smtp' && (schema.transportSettings.smtp.port === '' || schema.transportSettings.smtp.port === '' || !isEmpty(schema.transportSettings.smtp.auth)))
    return false;
  if(schema.transport === 'mandrill' && schema.transportSettings.mandrill.apiKey === ''  )
    return false
  if(schema.transport === 'sendgrid' && schema.transportSettings.sendgrid.apiKey === '')
  return true;
}, {
  message: 'You need to fill in all the fields below for this transport',
  path: ['transport']
});
export const Settings = ({data}:Props) => {
  const [emailModule, setEmailModule] = useState<boolean>(false)
  const [edit ,setEdit] = useState<boolean>(false)
  const { addAlert } = useAlerts();

  const router = useRouter();

  useEffect(()=>{
    if(data){
      setEmailModule(data.active)
    }
  },[data])

  const form  = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data,
  });

  const { reset, control, handleSubmit, setValue, watch } = form;

  const handleSwitchChange = () => {
    addAlert({
      title: 'Email Module',
      description: `Are you sure you want to ${emailModule ? 'disable' : 'enable'} email module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: (cancel) => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'Email',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className='text-sm text-foreground'>Updating Email Settings...</p>
              </div>
            ),
          });
          const updatedSettings = {
            sendingDomain:'',
            active: !emailModule,
            transport:'smtp' as TransportProviders,
            transportSettings:{
              ...data.transportSettings,
                smtp:{
                    port: '',
                    host: '',
                    secure: false,
                    ignoreTls: false,
                    auth: {
                      username: '',
                      password: '',
                      method: '',
                    },
                }
              }
          }
          patchEmailSettings(updatedSettings).then(
            (res)=> {
              dismiss();
              toast({
                title: 'Email',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className='text-sm text-foreground'>Email Settings Updated!</p>
                  </div>
                ),
              });
              router.refresh()
            }
          ).catch(err => {
            dismiss()
            toast({
              title: 'Email',
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
          })
        }},
    });
  }

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setEdit(false);
    const { id, dismiss } = toast({
      title: 'Email',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Updating Email Settings...</p>
        </div>
      ),
    });

    patchEmailSettings(data).then((res) => {
      dismiss();
      const emailModule = res.find((module:Module) => module.moduleName === 'email')
      if (emailModule && emailModule.serving)
        toast({
          title: 'Email',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className='text-sm text-foreground'>Email Settings Updated!</p>
            </div>
          ),
        });
      else
        toast({
          title: 'Email',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className='text-sm'>Failed to update with:</p>
              </div>
              <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
                <code className='text-sm text-foreground'>Activation was not successful. Check the logs for more info</code>
              </pre>
            </div>
          ),
        });
    }).catch((error) => {
      dismiss();
      toast({
        title: 'Email',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className='text-sm'>Failed to update with:</p>
            </div>
            <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
              <code className='text-sm text-foreground'>{error.message}</code>
            </pre>
          </div>
        ),
      });
    });
  }

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">
              Email Module
            </p>
            <Switch
              checked={emailModule}
              onCheckedChange={()=>{
                handleSwitchChange()
              }}
            />
          </div>
          <div className={'pr-2 w-7/12'}>
            <p className={'text-xs text-[#94A3B8]'}>
              Since you have created an account on one of the Supported Providers (Mailgun, Sendgrid, Mandrill, Smtp), you need to configure the provider to proceed with the activation of the module. Visit documentation for <a href={'https://getconduit.dev/docs/modules/email/config#mandrill'} className='hover:underline' target={'_blank'}>Mandrill</a>, <a href={'https://getconduit.dev/docs/modules/email/config#sendgrid'} className='hover:underline' target={'_blank'}>Sendgrid</a>.
            </p>
          </div>
        </div>
        {emailModule &&
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SettingsForm
                control={control}
                edit={edit}
                setEdit={setEdit}
                watch={watch}
                reset={reset}
                data={data}
              />
            </form>
          </Form>
        }
      </div>
    </div>
  )
}
