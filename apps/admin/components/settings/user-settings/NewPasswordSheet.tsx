'use client';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { changePassword } from '@/lib/api/settings';
import { LucideX } from 'lucide-react';

const FormSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string()
}).refine(schema => {
  if (schema.newPassword !== schema.confirmPassword)
    return false;
  return true;
}, {
  message: 'Passwords do not match!',
  path: ['confirmPassword']
});;

export const NewPasswordSheet = ({ children, defaultOpen, onClose, onSuccess }: {
  children?: ReactNode,
  onSuccess?: (user: User) => void,
  onClose?: () => void,
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen !== undefined ? defaultOpen : false);

  const { addAlert } = useAlerts();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const {reset, handleSubmit,  control,formState } = form;

  useEffect(() => {
    if (defaultOpen !== undefined) setOpen(defaultOpen);
  }, [defaultOpen]);

  useEffect(() => {
    if (!open && formState.isSubmitted) {
      onClose?.();
      return reset();
    }
    if (!open && formState.isDirty) {
      addAlert({
        title: 'Change Password',
        description: 'Are you sure you want to close this sheet? Any unsaved changes will be lost.',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: (cancel) => {
          if (!cancel) {
            onClose?.();
            return reset();
          }
          setOpen(true);
        },
      });
    } else if (!open) {
      onClose?.();
    }
  }, [open]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    changePassword(data.oldPassword, data.newPassword).then((res) =>{
      toast({
        title: 'Password',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <p className='text-sm text-foreground'>Password changed!</p>
          </div>
        ),
      });
    }).catch((err)=>{
      toast({
        title: 'Settings',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className='text-sm'>Failed to add with:</p>
            </div>
            <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
              <code className='text-sm text-foreground'>{err.message}</code>
            </pre>
          </div>
        ),
      });
    })
  }

  return <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
    <SheetTrigger asChild>
      {children}
    </SheetTrigger>
    <SheetContent side='right'>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>Change your password</SheetTitle>
          </SheetHeader>
          <div className='grid gap-4 py-4'>
            <FormField
              control={control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormLabel className={'text-left'}>Old Password</FormLabel>
                  <FormControl>
                    <Input placeholder='old password' type={'password'} className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='newPassword'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder='very secret' type='password' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormLabel>Confirm new Password</FormLabel>
                  <FormControl>
                    <Input placeholder='very secret' type='password' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
          </div>
          <SheetFooter>
            <Button type='submit'>Submit</Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  </Sheet>;
};