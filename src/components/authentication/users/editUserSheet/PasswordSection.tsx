'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { useUserMutation } from '@/components/authentication/users/useUserMutation';
import {
  sendUserPasswordReset,
  setUserPassword,
} from '@/lib/api/authentication';
import type { ActionFailure } from '@/lib/api/action-result';
import {
  hasAction,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import {
  adminPasswordFormSchema,
  passwordByteLength,
} from '@/lib/authentication/userValidation';
import { toast } from '@/lib/hooks/use-toast';
import { rhfZodResolver } from '@/lib/zod-form';
import type { User } from '@/lib/models/User';

type PasswordValues = {
  password: string;
  confirm: string;
  revokeSessions: boolean;
};

type PasswordStatus =
  | { kind: 'closed' }
  | { kind: 'open' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string };

function passwordFailure(failure: ActionFailure): string {
  if (failure.status === 404 || failure.code === 'NOT_FOUND') {
    return 'Not supported by this Conduit version';
  }
  if (failure.code === 'FAILED_PRECONDITION') {
    return failure.message && failure.message !== 'Precondition failed'
      ? failure.message
      : 'This user does not sign in with a password';
  }
  return failure.message || 'The password could not be updated.';
}

export function PasswordSection({
  user,
  capabilities,
}: Readonly<{
  user: User;
  capabilities: UserAdminCapabilities;
}>) {
  const canSet = hasAction(capabilities, 'setPassword');
  const canReset = hasAction(capabilities, 'sendPasswordReset');
  const router = useRouter();
  const { status: resetStatus, run } = useUserMutation();
  const [status, setStatus] = useState<PasswordStatus>({ kind: 'closed' });
  const form = useForm<PasswordValues>({
    resolver: rhfZodResolver(adminPasswordFormSchema()),
    defaultValues: { password: '', confirm: '', revokeSessions: true },
  });
  const password = form.watch('password');
  const longPassword = passwordByteLength(password ?? '') > 72;

  if (user.isAnonymous || (!canSet && !canReset)) return null;

  const save = form.handleSubmit(async values => {
    setStatus({ kind: 'saving' });
    const result = await setUserPassword(
      user._id,
      values.password,
      values.revokeSessions
    );
    if (!result.ok) {
      setStatus({ kind: 'error', message: passwordFailure(result) });
      return;
    }
    setStatus({ kind: 'closed' });
    form.reset({ password: '', confirm: '', revokeSessions: true });
    toast({ title: 'Password updated' });
    router.refresh();
  });

  const sendReset = () => {
    void run({
      confirm: {
        title: 'Send reset email',
        description: `Send a password reset email to ${user.email}?`,
        actionText: 'Send reset email',
      },
      perform: () => sendUserPasswordReset(user._id),
      success: { title: 'Password reset email sent' },
      failure: {
        title: 'Could not send reset email',
        description: failure => passwordFailure(failure),
      },
      unsupportedOn404: true,
    });
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="user-password">
      <h3 id="user-password" className="text-sm font-medium text-balance">
        Password
      </h3>
      <div className="flex flex-wrap gap-2">
        {canSet && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStatus({ kind: 'open' })}
          >
            Set password
          </Button>
        )}
        {canReset && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resetStatus === 'confirming' || resetStatus === 'saving'}
            onClick={sendReset}
          >
            Send reset email
          </Button>
        )}
      </div>
      <Dialog
        open={
          status.kind === 'open' ||
          status.kind === 'saving' ||
          status.kind === 'error'
        }
        onOpenChange={open => {
          if (!open && status.kind !== 'saving') {
            setStatus({ kind: 'closed' });
            form.reset({ password: '', confirm: '', revokeSessions: true });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-balance">Set password</DialogTitle>
            <DialogDescription className="text-pretty">
              The user can sign in with this password.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={save} className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} autoComplete="new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {longPassword && (
                <p className="text-pretty text-xs text-muted-foreground">
                  Passwords longer than 72 bytes are truncated.
                </p>
              )}
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} autoComplete="new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revokeSessions"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={checked =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Sign the user out everywhere
                    </FormLabel>
                  </FormItem>
                )}
              />
              {status.kind === 'error' && (
                <p role="alert" className="text-sm text-destructive">
                  {status.message}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={status.kind === 'saving'}>
                  Set password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
