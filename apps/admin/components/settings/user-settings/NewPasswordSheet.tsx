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

const FormSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmNewPassword: z.string()
});

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
        title: 'Change Password',
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
    //TODO: endpoint for password
    const { id, dismiss } = toast({
      title: 'New Password',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <p className='text-sm text-foreground'>Password changed!</p>
        </div>
      ),
    });
  }

  return <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
    <SheetTrigger asChild>
      {children}
    </SheetTrigger>
    <SheetContent side='right'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>Change your password</SheetTitle>
          </SheetHeader>
          <div className='grid gap-4 py-4'>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem className='grid grid-cols-4 items-center gap-x-4'>
                  <FormLabel className={'text-left'}>Old Password</FormLabel>
                  <FormControl>
                    <Input placeholder='old password' type={'password'} className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem className='grid grid-cols-4 items-center gap-x-4'>
                  <FormLabel className={'text-left'}>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder='very secret' type='password' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmNewPassword'
              render={({ field }) => (
                <FormItem className='grid grid-cols-4 items-center gap-x-4'>
                  <FormLabel className={'text-left'}>Confirm new Password</FormLabel>
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
