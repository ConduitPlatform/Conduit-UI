import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Admin } from '@/lib/models/User';
import { useAlerts } from '@/components/providers/AlertProvider';
import { postNewAdminUser } from '@/lib/api/settings/admins';
import { LucideX } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  username: z.string(),
  password: z.string(),
  confirmPassword: z.string()
}).refine(schema => {
  if (schema.password !== schema.confirmPassword)
    return false;
  return true;
}, {
  message: 'Passwords do not match!',
  path: ['confirmPassword']
});

export const AddAdminSheet = ({ children, defaultOpen, onClose, onSuccess }: {
  children?: ReactNode,
  onSuccess?: (user: Admin) => void,
  onClose?: () => void,
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen !== undefined ? defaultOpen : false);
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const router = useRouter()

  const {formState, reset, control,handleSubmit} = form;

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
        title: 'Add Admin',
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
    postNewAdminUser(data.username,data.password).then((res)=>{
      setOpen(false);
      toast({
        title: 'New Admin',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <p className='text-sm text-foreground'>Admin added!</p>
          </div>
        ),
      });
      router.refresh()
    }).catch((err)=>{
      console.log(err.message)
      toast({
        title: 'New Admin',
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
            <SheetTitle>Create new admin user</SheetTitle>
            <SheetDescription>
              Add a new admin to the database. Click Create when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className='grid gap-4 py-4'>

            <FormField
              control={control}
              name='username'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormLabel >Username</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter a username' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='password'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormLabel >Password</FormLabel>
                  <FormControl>
                    <Input autoComplete="new-password" placeholder='very secret' type='password' className='col-span-3' {...field} />
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
                  <FormLabel >Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder='very secret' type='password' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />

          </div>
          <SheetFooter>
            <Button type='submit'>Create</Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  </Sheet>;
};