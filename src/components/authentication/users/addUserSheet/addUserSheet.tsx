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
import { rhfZodResolver } from '@/lib/zod-form';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { ErrorPre } from '@/components/ui/error-pre';
import { createUser } from '@/lib/api/authentication';
import { User } from '@/lib/models/User';
import { useAlerts } from '@/components/providers/AlertProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HOME_REALM_GLOBAL,
  homeRealmSelectionToTeamId,
} from '@/lib/authentication/realmMembers';

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  // Realm team id, or 'global' for a user without a home realm.
  homeRealm: z.string().optional(),
});

export const AddUserSheet = ({
  children,
  defaultOpen,
  onClose,
  onSuccess,
  realmsEnabled = false,
  realmSlugs,
}: {
  children?: ReactNode;
  /** Shows the optional "Home realm" select. */
  realmsEnabled?: boolean;
  /** `teamId -> slug` of every realm; the select offers these plus Global. */
  realmSlugs?: ReadonlyMap<string, string>;
  onSuccess?: (user: User) => void;
  onClose?: () => void;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: { email: '', password: '', homeRealm: HOME_REALM_GLOBAL },
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
        title: 'Add User',
        description:
          'Are you sure you want to close this sheet? Any unsaved changes will be lost.',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: cancel => {
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
    const { id, dismiss } = toast({
      title: 'Add User',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">Adding user...</p>
        </div>
      ),
    });
    const homeRealm = realmsEnabled
      ? homeRealmSelectionToTeamId(data.homeRealm ?? HOME_REALM_GLOBAL)
      : null;
    const showError = (message: string | undefined) => {
      dismiss();
      toast({
        title: 'Add User',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className="text-sm">Failed to add with:</p>
            </div>
            <ErrorPre>{message}</ErrorPre>
          </div>
        ),
      });
    };
    createUser(data.email, data.password, homeRealm ? { homeRealm } : undefined)
      .then(result => {
        if (!result.ok) {
          showError(result.message);
          return;
        }
        setOpen(false);
        dismiss();
        onSuccess?.(result.data);
        toast({
          title: 'Add User',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">User added!</p>
            </div>
          ),
        });
      })
      .catch((error: unknown) => {
        showError(error instanceof Error ? error.message : undefined);
      });
  }

  return (
    <Sheet open={open} onOpenChange={open => setOpen(open)}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete={'off'}>
            <SheetHeader>
              <SheetTitle>Add User</SheetTitle>
              <SheetDescription>
                Add a new user to the database. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-x-4">
                    <FormLabel className={'text-right'}>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="mail@conduit.com"
                        className="col-span-3"
                        autoComplete={'off'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={'text-right col-span-4'} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-x-4">
                    <FormLabel className={'text-right'}>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="very secret"
                        type="password"
                        autoComplete={'new-password'}
                        className="col-span-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={'text-right col-span-4'} />
                  </FormItem>
                )}
              />
              {realmsEnabled && (
                <FormField
                  control={form.control}
                  name="homeRealm"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-x-4">
                      <FormLabel className={'text-right'}>Home realm</FormLabel>
                      <Select
                        value={field.value ?? HOME_REALM_GLOBAL}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={HOME_REALM_GLOBAL}>
                            Global
                          </SelectItem>
                          {Array.from(realmSlugs ?? [], ([id, slug]) => (
                            <SelectItem key={id} value={id}>
                              {slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className={'text-right col-span-4'} />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <SheetFooter>
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
