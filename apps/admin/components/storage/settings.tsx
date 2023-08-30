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

interface Props {
  data?:any
}

const FormSchema = z.object({
  containerCreation: z.boolean().optional(),
  provider: z.string().optional(),
  connection: z.string().optional(),
});
export const Settings = ({data}:Props) => {
  const [storageModule, setStorageModule] = useState<boolean>(false)
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
      title: 'Storage',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <CheckIcon className={'w-8 h-8'} />
          <p className='text-sm text-foreground'>Storage Settings Updated!</p>
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
            Storage Module
          </p>
            <Switch
              checked={storageModule}
              onCheckedChange={()=>{addAlert({
                title: 'Storage Module',
                description: `Are you sure you want to ${storageModule ? 'deactivate' : 'activate'} storage module?`,
                cancelText: 'Cancel',
                actionText: 'Proceed',
                onDecision: (cancel) => {
                  if (!cancel) {
                    setStorageModule(!storageModule);
                  }
                },
              });
              }}
            />
        </div>
        <div className={'pr-2'}>
          <p className={'text-xs text-[#94A3B8]'}>To get an idea on how to setup your storage provider, take a look at the documentation for <a href={'https://getconduit.dev/docs/modules/storage/config#local-storage'} className='hover:underline' target={'_blank'}>Local</a>, <a href={'https://getconduit.dev/docs/modules/storage/config#azure-storage'} className='hover:underline' target={'_blank'}>Azure</a>, <a href={'https://getconduit.dev/docs/modules/storage/config#google-storage'} className='hover:underline' target={'_blank'}>Google</a> and <a href={'https://getconduit.dev/docs/modules/storage/config#amazon-storage'} className='hover:underline' target={'_blank'}>AS3</a>. </p>
        </div>
      </div>
      {storageModule &&
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
           <div className={'flex flex-col gap-4'}>
             <FormField
               control={form.control}
               name="containerCreation"
               render={({ field }) => (
                 <FormItem className="flex flex-row items-center justify-between rounded-md border px-3 py-6 w-5/12">
                   <FormLabel className="text-base">
                     Allow Container Creation
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
             <div className={'flex gap-4'}>
               <FormField
                 control={form.control}
                 name='provider'
                 render={({ field }) => (
                   <FormItem className={'w-5/12'} >
                     <FormLabel
                     >Storage provider</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!edit}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder='Select a provider' />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent className={'bg-white dark:bg-popover'}>
                         <SelectItem value={'azure'}>Azure</SelectItem>
                         <SelectItem value={'google'}>Google</SelectItem>
                         <SelectItem value={'local'}>Local</SelectItem>
                         <SelectItem value={'s3'}>S3</SelectItem>
                         <SelectItem value={'aliyun'}>Aliyun OSS</SelectItem>
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name='connection'
                 render={({ field }) => (
                   <FormItem className={'w-5/12'}>
                     <FormLabel>
                       Connection string
                     </FormLabel>
                     <FormControl>
                       <Input
                         disabled={!edit}
                         title={'URL'}
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
          </div>
            <div className={'w-10/12 py-4 ml-4 flex justify-end'}>
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