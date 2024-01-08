'use client';
import { FormSettings } from '@/lib/models/Form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX, Paperclip, ShieldCheck } from 'lucide-react';
import { patchFormsSettings } from '@/lib/api/forms';
import { useRouter } from 'next/navigation';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface Props {
  data: FormSettings,
  captchaAvailable: boolean,
}

const FormSchema = z.object({
  useAttachments: z.boolean(),
  captcha: z.boolean(),
})

export const Settings = ({ data, captchaAvailable }: Props) => {
  const [formsModule, setFormsModule] = useState<boolean>(false)
  const [edit, setEdit] = useState<boolean>(false)
  const { addAlert } = useAlerts();

  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data
  });

  const { reset, control, handleSubmit, watch } = form;

  useEffect(()=>{
    if(data){
      setFormsModule(data.active)
    }
  },[data]);

  const handleSwitchChange = () => {
    addAlert({
      title: 'Forms Module',
      description: `Are you sure you want to ${formsModule ? 'disable' : 'enable'} forms module?`,
      cancelText: 'Cancel',
      actionText: 'Proceed',
      onDecision: (cancel) => {
        if (!cancel) {
          const { id, dismiss } = toast({
            title: 'Forms',
            description: (
              <div className={'flex flex-row items-center space-x-2.5'}>
                <LoaderIcon className={'w-8 h-8 animate-spin'} />
                <p className='text-sm text-foreground'>Updating Form Settings...</p>
              </div>
            ),
          });
          const updatedSettings = {
            active: !formsModule,
          }
          setFormsModule(!formsModule);
          patchFormsSettings(updatedSettings).then(
            res=> {
              dismiss();
              toast({
                title: 'Forms',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className='text-sm text-foreground'>Forms Settings Updated!</p>
                  </div>
                ),
              });
            }
          ).catch(err => {
            dismiss()
            setFormsModule(data.active);
            toast({
              title: 'Forms',
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

  const onSubmit = (formData: z.infer<typeof FormSchema>) => {
    setEdit(false);
    const { id, dismiss } = toast({
      title: 'Forms',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Updating Form Settings...</p>
        </div>
      ),
    });
    patchFormsSettings(formData).then(res=>{
      dismiss();
      const formModule = res.find(module => module.moduleName === 'forms')
      if (formModule && formModule.serving)
        toast({
          title: 'Forms',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className='text-sm text-foreground'>Form Settings Updated!</p>
            </div>
          ),
        });
      else
        toast({
          title: 'Forms',
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
      router.refresh()
    }).catch((err)=>{
      dismiss();
      toast({
        title: 'Forms',
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
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">
              Forms Module
            </p>
            <Switch
              checked={formsModule}
              onCheckedChange={()=>{
                handleSwitchChange()
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>
              To see more information regarding the Forms config, visit our <a href={'https://getconduit.dev/docs/modules/forms/config'} className='hover:underline' target={'_blank'}>docs</a>.
            </p>
          </div>
        </div>
        {formsModule &&
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex gap-x-5 items-center">
                <div className="w-5/12 flex items-center justify-center gap-x-4 rounded-md border p-4">
                  <Paperclip />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Attachments
                    </p>
                    <p className="text-sm text-muted-foreground w-11/12">
                      Enable support for attachment fields in forms.
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name="useAttachments"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          disabled={!edit}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    )}
                  />
                </div>
                <div className=" w-5/12 flex items-center justify-center gap-x-4 rounded-md border p-4">
                  <ShieldCheck />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Captcha
                    </p>
                    <p className="text-sm text-muted-foreground w-11/12">
                      Enable support for captcha in forms.
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name="captcha"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          disabled={!edit || (!field.value && !captchaAvailable)}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    )}
                  />
                </div>
              </div>
              <div className={'py-4 flex justify-end'}>
                {edit ?
                  <div className={'flex gap-2'}>
                    <Button
                      type='button'
                      className={'dark:border-gray-500'}
                      variant={'outline'}
                      onClick={()=> {
                        reset();
                        setEdit(false);
                      }}>Cancel</Button>
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