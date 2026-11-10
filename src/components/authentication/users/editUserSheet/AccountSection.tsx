'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useUserMutation } from '@/components/authentication/users/useUserMutation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { updateUser } from '@/lib/api/authentication';
import {
  hasAction,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import { userPatch } from '@/lib/authentication/userPatch';
import {
  changeEmailSchema,
  emailChangeError,
  normalizePhone,
  phoneSchema,
} from '@/lib/authentication/userValidation';
import { rhfZodResolver } from '@/lib/zod-form';
import type { User } from '@/lib/models/User';

type EmailValues = { email: string; verified: boolean };

type PhoneStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string };

export function AccountSection({
  user,
  capabilities,
  onSaved,
}: Readonly<{
  user: User;
  capabilities: UserAdminCapabilities;
  onSaved: (
    patch: Partial<Pick<User, 'email' | 'isVerified' | 'phoneNumber'>>
  ) => void;
}>) {
  const [emailMode, setEmailMode] = useState<'read' | 'edit'>('read');
  const phoneKey = `${user._id}:${user.phoneNumber ?? ''}`;
  const [seenPhone, setSeenPhone] = useState(phoneKey);
  const [phone, setPhone] = useState(user.phoneNumber ?? '');
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>({ kind: 'idle' });
  if (seenPhone !== phoneKey) {
    setSeenPhone(phoneKey);
    setPhone(user.phoneNumber ?? '');
    setPhoneStatus({ kind: 'idle' });
  }
  const router = useRouter();
  const { status, run } = useUserMutation();
  const emailSchema = useMemo(
    () => changeEmailSchema(user.email ?? ''),
    [user.email]
  );
  const form = useForm<EmailValues>({
    resolver: rhfZodResolver(emailSchema),
    defaultValues: { email: '', verified: true },
  });
  const busy = status === 'confirming' || status === 'saving';
  const hasEmail = user.email.trim() !== '';
  const smsTwoFa = user.hasTwoFA && user.twoFaMethod === 'sms';
  const canClearPhone = hasAction(capabilities, 'clearPhone');

  const saveEmail = form.handleSubmit(async values => {
    const outcome = await run({
      confirm: {
        title: 'Change email',
        description: `Change ${user.email} to ${values.email}? ${
          values.verified
            ? 'The new address will be marked verified.'
            : 'The new address will be marked unverified.'
        }`,
        actionText: 'Change email',
      },
      perform: () =>
        updateUser(
          user._id,
          userPatch(user, { email: values.email, isVerified: values.verified })
        ),
      success: {
        title: 'Email updated',
        description: `${values.email} is the address on this account.`,
      },
      failure: {
        title: 'Could not change email',
        description: failure => failure.message,
      },
      onFailure: failure => {
        const message = emailChangeError(failure);
        if (!message) return false;
        form.setError('email', { message });
        return true;
      },
    });
    if (outcome.ok) {
      onSaved({ email: values.email, isVerified: values.verified });
      setEmailMode('read');
      form.reset({ email: '', verified: true });
    }
  });

  const savePhone = async () => {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setPhoneStatus({
        kind: 'error',
        message:
          parsed.error.issues[0]?.message ??
          'Use international format, e.g. +306912345678',
      });
      return;
    }
    if (parsed.data === normalizePhone(user.phoneNumber ?? '')) return;
    setPhoneStatus({ kind: 'saving' });
    const result = await updateUser(
      user._id,
      userPatch(user, { phoneNumber: parsed.data })
    );
    if (!result.ok) {
      setPhoneStatus({ kind: 'error', message: result.message });
      return;
    }
    setPhoneStatus({ kind: 'idle' });
    onSaved({ phoneNumber: parsed.data });
    router.refresh();
  };

  const removePhone = () => {
    void run({
      confirm: {
        title: 'Remove phone number',
        description: `Remove the phone number from ${user.email || 'this account'}?`,
        actionText: 'Remove',
        variant: 'destructive',
      },
      perform: () => updateUser(user._id, userPatch(user, { phoneNumber: '' })),
      success: { title: 'Phone number removed' },
      failure: {
        title: 'Could not remove phone number',
        description: failure => failure.message,
      },
    }).then(outcome => {
      if (!outcome.ok) return;
      setPhone('');
      onSaved({ phoneNumber: '' });
    });
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="user-account">
      <h3 id="user-account" className="text-sm font-medium text-balance">
        Account
      </h3>
      {hasEmail && emailMode === 'read' && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="truncate text-sm">{user.email}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEmailMode('edit')}
          >
            Change
          </Button>
        </div>
      )}
      {hasEmail && emailMode === 'edit' && (
        <Form {...form}>
          <form noValidate onSubmit={saveEmail} className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="off"
                      placeholder="mail@conduit.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verified"
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
                    Mark the new address as verified
                  </FormLabel>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy}>
                Save email
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEmailMode('read')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
      {!hasEmail && (
        <p className="text-sm text-muted-foreground">No email address</p>
      )}
      {!hasEmail && (
        <p className="text-pretty text-sm text-muted-foreground">
          This may be the user&apos;s sign-in identifier.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-phone">Phone</Label>
        <div className="flex items-center gap-2">
          <Input
            id="user-phone"
            value={phone}
            onChange={event => {
              setPhone(event.target.value);
              if (phoneStatus.kind === 'error')
                setPhoneStatus({ kind: 'idle' });
            }}
            placeholder="+306912345678"
            autoComplete="off"
            aria-describedby={
              phoneStatus.kind === 'error' ? 'user-phone-error' : undefined
            }
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void savePhone()}
            disabled={phoneStatus.kind === 'saving'}
          >
            Save
          </Button>
          {canClearPhone &&
            (smsTwoFa ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex" tabIndex={0}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                      >
                        Remove
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Disable 2FA first</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removePhone}
                disabled={!user.phoneNumber && phone.trim() === ''}
              >
                Remove
              </Button>
            ))}
        </div>
        {phoneStatus.kind === 'error' && (
          <p
            id="user-phone-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {phoneStatus.message}
          </p>
        )}
      </div>
    </section>
  );
}
