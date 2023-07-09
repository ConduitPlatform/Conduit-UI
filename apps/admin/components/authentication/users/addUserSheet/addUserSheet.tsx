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
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { toast } from '@/lib/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { createUser } from '@/lib/api/authentication';
import { User } from '@/lib/models/User';

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const AddUserSheet = ({ children, onSuccess }: { children?: ReactNode, onSuccess?: (user: User) => void }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { id, dismiss } = toast({
      title: 'Add User',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Adding user...</p>
        </div>
      ),
    });
    createUser(data.email, data.password)
      .then((user) => {
        form.reset();
        setOpen(false);
        dismiss();
        onSuccess?.(user);
        toast({
          title: 'Add User',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className='text-sm text-foreground'>User added!</p>
            </div>
          ),
        });
      })
      .catch((error) => {
        dismiss();
        toast({
          title: 'Add User',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className='text-sm'>Failed to add with:</p>
              </div>
              <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
              <code className='text-sm text-foreground'>{error.message}</code>
        </pre>
            </div>

          ),
        });
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
            <SheetTitle>Add User</SheetTitle>
            <SheetDescription>
              Add a new user to the database. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className='grid gap-4 py-4'>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='grid grid-cols-4 items-center gap-x-4'>
                  <FormLabel className={'text-right'}>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='mail@conduit.com' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='grid grid-cols-4 items-center gap-x-4'>
                  <FormLabel className={'text-right'}>Password</FormLabel>
                  <FormControl>
                    <Input placeholder='very secret' type='password' className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage className={'text-right col-span-4'} />
                </FormItem>
              )}
            />

          </div>
          <SheetFooter>
            <Button type='submit'>Save changes</Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  </Sheet>;
};
