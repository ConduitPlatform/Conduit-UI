'use client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckIcon,
  Clipboard,
  Loader2,
  LoaderIcon,
  LucideX,
} from 'lucide-react';
import { ErrorPre } from '@/components/ui/error-pre';
import { createPersistentInvite } from '@/lib/api/authentication';
import { getResourceDefinition } from '@/lib/api/authorization';
import {
  TEAM_RESOURCE_NAME,
  teamMemberRolesAllowedForUser,
} from '@/lib/authorization/teamMemberRoles';
import { useAlerts } from '@/components/providers/AlertProvider';

const FormSchema = z.object({
  role: z.string().min(1, 'Role is required'),
});

export const CreateInviteSheet = ({
  children,
  teamId,
  defaultOpen,
  onClose,
  onSuccess,
}: {
  children?: ReactNode;
  teamId: string;
  onSuccess?: () => void;
  onClose?: () => void;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { addAlert } = useAlerts();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: rhfZodResolver(FormSchema),
    defaultValues: { role: 'member' },
  });

  useEffect(() => {
    if (defaultOpen !== undefined) setOpen(defaultOpen);
  }, [defaultOpen]);

  useEffect(() => {
    if (!open || generatedToken) return;
    setLoadingRoles(true);
    setLoadError(null);
    void getResourceDefinition(TEAM_RESOURCE_NAME)
      .then(def => {
        if (def == null) {
          setAllowedRoles([]);
          setLoadError(
            'Team resource definition was not found. Create a Team resource in Authorization.'
          );
          return;
        }
        const allowed = teamMemberRolesAllowedForUser(def);
        setAllowedRoles(allowed);
        if (allowed.length === 0) {
          setLoadError(
            'The Team resource has no relations that allow User subjects. Configure roles in Authorization (Team resource definition).'
          );
          return;
        }
        const next = allowed.includes('member')
          ? 'member'
          : (allowed[0] ?? 'member');
        form.setValue('role', next);
      })
      .catch(() => {
        setLoadError('Could not load the Team resource definition.');
      })
      .finally(() => setLoadingRoles(false));
  }, [open, generatedToken, form]);

  useEffect(() => {
    if (!open && (form.formState.isSubmitted || generatedToken)) {
      onClose?.();
      form.reset();
      setGeneratedToken(null);
      setAllowedRoles([]);
      setLoadError(null);
      return;
    }
    if (!open && form.formState.isDirty) {
      addAlert({
        title: 'Create Invite',
        description:
          'Are you sure you want to close? Any unsaved changes will be lost.',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: cancel => {
          if (!cancel) {
            onClose?.();
            form.reset();
            setGeneratedToken(null);
            setAllowedRoles([]);
            setLoadError(null);
            return;
          }
          setOpen(true);
        },
      });
    } else if (!open) {
      onClose?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { dismiss } = toast({
      title: 'Create Invite',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">Creating invite...</p>
        </div>
      ),
    });
    createPersistentInvite(teamId, data.role)
      .then(token => {
        dismiss();
        setGeneratedToken(token);
        onSuccess?.();
        toast({
          title: 'Invite Created',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">
                Persistent invite token created
              </p>
            </div>
          ),
        });
      })
      .catch(error => {
        dismiss();
        toast({
          title: 'Create Invite',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to create invite:</p>
              </div>
              <ErrorPre>{error.message}</ErrorPre>
            </div>
          ),
        });
      });
  }

  const canSubmit =
    !loadingRoles && !loadError && allowedRoles.length > 0 && !generatedToken;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        {generatedToken ? (
          <>
            <SheetHeader>
              <SheetTitle>Invite Created</SheetTitle>
              <SheetDescription>
                Share this token with your client application. Users who
                register with this token will automatically join this team.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Invitation Token</label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={generatedToken}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      void navigator.clipboard.writeText(generatedToken);
                      toast({ title: 'Token copied to clipboard' });
                    }}
                  >
                    <Clipboard className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pass this token as the <code>invitationToken</code> parameter
                during user registration to auto-assign users to this team.
              </p>
            </div>
            <SheetFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </SheetFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <SheetHeader>
                <SheetTitle>Create Persistent Invite</SheetTitle>
                <SheetDescription>
                  Generate a reusable invitation token for this team. Unlike
                  email invites, persistent tokens can be used by multiple
                  users.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <p className="text-xs text-muted-foreground col-span-full">
                  Roles come from the &quot;{TEAM_RESOURCE_NAME}&quot; resource
                  definition (relations that allow User or *).
                </p>
                {loadingRoles ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Loading roles…
                  </div>
                ) : loadError ? (
                  <p className="text-sm text-destructive">{loadError}</p>
                ) : (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-x-4">
                        <FormLabel className={'text-right'}>Role</FormLabel>
                        <div className="col-span-3">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!canSubmit}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allowedRoles.map(r => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage className={'text-right col-span-4'} />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <SheetFooter>
                <Button type="submit" disabled={!canSubmit}>
                  Create Invite
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
};
