import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useEffect, useState } from 'react';
import { useAlerts } from '@/components/providers/AlertProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { changeAdminsPasswordById } from '@/lib/api/settings/admins';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LucideX } from 'lucide-react';

const FormSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine(
    schema => {
      if (schema.password !== schema.confirmPassword) return false;
      return true;
    },
    {
      message: 'Passwords do not match!',
      path: ['confirmPassword'],
    }
  );

export const ChangePasswordSheet = ({
  children,
  id,
}: {
  children?: ReactNode;
  id: string;
}) => {
  const [open, setOpen] = useState(false);
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { formState, reset, control, handleSubmit } = form;

  useEffect(() => {
    if (!open && formState.isSubmitted) {
      return reset();
    }
    if (!open && formState.isDirty) {
      addAlert({
        title: 'Add Admin',
        description:
          'Are you sure you want to close this sheet? Any unsaved changes will be lost.',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: cancel => {
          if (!cancel) {
            return reset();
          }
          setOpen(true);
        },
      });
    }
  }, [open]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    changeAdminsPasswordById(id, data.password)
      .then(res => {
        setOpen(false);
        toast({
          title: 'Admin Password',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">
                Password updated successfully!
              </p>
            </div>
          ),
        });
      })
      .catch(err => {
        toast({
          title: 'Admin Password',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to update with:</p>
              </div>
              <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                <code className="text-sm text-foreground">{err.message}</code>
              </pre>
            </div>
          ),
        });
      });
  }

  return (
    <Sheet open={open} onOpenChange={open => setOpen(open)}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SheetHeader>
              <SheetTitle>Change user&apos;s password</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="new-password"
                        placeholder="very secret"
                        type="password"
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={'text-right col-span-4'} />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="very secret"
                        type="password"
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={'text-right col-span-4'} />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button type="submit">Change password</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
