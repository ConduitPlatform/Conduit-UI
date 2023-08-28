'use client';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { toast } from '@/lib/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User } from '@/lib/models/User';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Switch } from '@/components/ui/switch';

const FormSchema = z.object({
  code: z.string(),
});

export const TwoFASheet = ({ children, defaultOpen, onClose, onSuccess }: {
  children?: ReactNode,
  onSuccess?: (user: User) => void,
  onClose?: () => void,
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen !== undefined ? defaultOpen : false);
  const [switchValue, setSwitchValue] = useState<boolean>(false)
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  useEffect(() => {
    if (defaultOpen !== undefined) setOpen(defaultOpen);
  }, [defaultOpen]);
  useEffect(() => {
    if (!open && form.formState.isSubmitted) {
      onClose?.();
      return form.reset();
    }
    if (!open && form.formState.isDirty) {
      addAlert({
        title: '2FA',
        description: 'Are you sure you want to close this sheet? Any unsaved changes will be lost.',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: (cancel) => {
          if (!cancel) {
            onClose?.();
            return form.reset();
          }
          setOpen(true);
        },
      });
    } else if (!open) {
      onClose?.();
    }
  }, [open]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    //TODO: endpoint for 2fa
    const { id, dismiss } = toast({
      title: '2FA',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <p className='text-sm text-foreground'>Two factor Authentication Enabled!</p>
        </div>
      ),
    });
  }

  return <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
    <Switch defaultValue={switchValue.toString()} onClick={()=>{if(!switchValue) setOpen(true); setSwitchValue(!switchValue)}} />
    <SheetContent side='right'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>Enable Two Factor Authentication</SheetTitle>
          </SheetHeader>
          <div className='flex flex-col gap-4 py-4 items-center'>
            <div className={'bg-white w-[100px] h-[100px]'}/>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-4'>
                  <FormLabel className={'text-center'}>Please scan the qr code above and insert your verification code to continue</FormLabel>
                  <FormControl>
                    <Input placeholder='verification code' type={'password'} className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
          </div>
          <SheetFooter>
            <Button type='submit'>Proceed</Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  </Sheet>;
};
