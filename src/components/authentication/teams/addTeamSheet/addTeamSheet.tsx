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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { createTeam } from '@/lib/api/authentication';
import { useAlerts } from '@/components/providers/AlertProvider';
import { Team } from '@/lib/models/Team';

const FormSchema = z.object({
  name: z.string().nonempty('Name is required'),
});

export const AddTeamSheet = ({
  children,
  defaultOpen,
  onClose,
  onSuccess,
  parent,
}: {
  children?: ReactNode;
  onSuccess?: (team: Team) => void;
  onClose?: () => void;
  defaultOpen?: boolean;
  parent?: string;
}) => {
  const [open, setOpen] = useState(
    defaultOpen !== undefined ? defaultOpen : false
  );
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
        title: 'Add Team',
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
      title: 'Add Team',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">Adding team...</p>
        </div>
      ),
    });
    createTeam(data.name, {
      parentTeam: parent,
    })
      .then(team => {
        setOpen(false);
        dismiss();
        onSuccess?.(team);
        toast({
          title: 'Add Team',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">Team added!</p>
            </div>
          ),
        });
      })
      .catch(error => {
        dismiss();
        toast({
          title: 'Add Team',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to add with:</p>
              </div>
              <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                <code className="text-sm text-foreground">{error.message}</code>
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader>
              <SheetTitle>Add Team</SheetTitle>
              <SheetDescription>
                Add a new team to the database. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-x-4">
                    <FormLabel className={'text-right'}>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Cool Team"
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
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
