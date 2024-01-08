'use client';
import { z } from 'zod';
import { StorageSettings } from '@/lib/models/Storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAlerts } from '@/components/providers/AlertProvider';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Form} from '@/components/ui/form';
import { SettingsForm } from '@/components/storage/settingsForm';
import { patchStorageSettings } from '@/lib/api/storage';
import { FormSchema } from "@/components/storage/zod";

interface Props{
  data: StorageSettings;
  authzAvailable: boolean;
}

export const Settings = ({ data, authzAvailable }: Props) => {
  const [storageModule, setStorageModule] = useState<boolean>(false)
  const [edit, setEdit] = useState<boolean>(false)
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: data,
  });
  const { setValue, reset, control, handleSubmit, watch } = form;

  useEffect(()=>{
    if (data){
      setStorageModule(data.active)
    }
  },[data])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setEdit(false)
    const { id, dismiss } = toast({
      title: 'Storage',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Updating Storage Settings...</p>
        </div>
      ),
    });

    patchStorageSettings(data).then(res => {
      dismiss();
      const storageModule = res.find(module => module.moduleName === 'storage')
      if (storageModule && storageModule.serving)
        toast({
          title: 'Storage',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className='text-sm text-foreground'>Storage Settings Updated!</p>
            </div>
          ),
        });
      else
        toast({
          title: 'Storage',
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
        title: 'Storage',
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

  const handleSwitchChange = () => {
      addAlert({
        title: 'Storage Module',
        description: `Are you sure you want to ${storageModule ? 'disable' : 'enable'} storage module?`,
        cancelText: 'Cancel',
        actionText: 'Proceed',
        onDecision: (cancel) => {
          if (!cancel) {
            const { id, dismiss } = toast({
              title: 'Storage',
              description: (
                <div className={'flex flex-row items-center space-x-2.5'}>
                  <LoaderIcon className={'w-8 h-8 animate-spin'} />
                  <p className='text-sm text-foreground'>Updating Storage Settings...</p>
                </div>
              ),
            });
            const updatedSettings: Partial<StorageSettings> = {
              active: !storageModule,
              ...(!storageModule && { provider: 'local' }),
            }
            setValue('provider','local');
            setStorageModule(!storageModule);
            patchStorageSettings(updatedSettings).then(
              (res)=> {
                dismiss()
                toast({
                  title: 'Storage',
                  description: (
                    <div className={'flex flex-row items-center space-x-2.5'}>
                      <CheckIcon className={'w-8 h-8'} />
                      <p className='text-sm text-foreground'>Storage Settings Updated!</p>
                    </div>
                  ),
                });
              }
            ).catch(err => {
              dismiss()
              setStorageModule(data.active);
              setValue('provider',data.provider);
              toast({
                title: 'Storage',
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


  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">
              Storage Module
            </p>
            <Switch
              checked={storageModule}
              onCheckedChange={()=>{
                handleSwitchChange()
              }}
            />
          </div>
          <div className={'pr-2'}>
            <p className={'text-xs text-[#94A3B8]'}>
              To get an idea on how to setup your storage provider take a look at the documentation for  <a href={'https://getconduit.dev/docs/modules/storage/config#azure-storage'} className='hover:underline' target={'_blank'}>azure</a>,  <a href={'https://getconduit.dev/docs/modules/storage/config#google-storage'} className='hover:underline' target={'_blank'}>google</a>,  <a href={'https://getconduit.dev/docs/modules/storage/config#amazon-storage'} className='hover:underline' target={'_blank'}>aws</a> or <a href={'https://getconduit.dev/docs/modules/storage/config#local-storage'} className='hover:underline' target={'_blank'}>local</a> provider.
            </p>
          </div>
        </div>
        {storageModule &&
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SettingsForm
                control={control}
                edit={edit}
                setEdit={setEdit}
                watch={watch}
                reset={reset}
                data={data}
                authzAvailable={authzAvailable}
              />
            </form>
          </Form>
        }
      </div>
    </div>
  )
}
