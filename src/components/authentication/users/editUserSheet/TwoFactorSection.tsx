'use client';

import { useUserMutation } from '@/components/authentication/users/useUserMutation';
import { Button } from '@/components/ui/button';
import { resetUserTwoFa, updateUser } from '@/lib/api/authentication';
import {
  hasAction,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import { userPatch } from '@/lib/authentication/userPatch';
import type { User } from '@/lib/models/User';

function twoFaLabel(user: Pick<User, 'hasTwoFA' | 'twoFaMethod'>): string {
  if (!user.hasTwoFA) return 'Off';
  if (user.twoFaMethod === 'authenticator')
    return 'Enabled (Authenticator app)';
  if (user.twoFaMethod === 'sms' || user.twoFaMethod === 'phone') {
    return 'Enabled (SMS)';
  }
  return 'Enabled';
}

export function TwoFactorSection({
  user,
  capabilities,
  onSaved,
}: Readonly<{
  user: User;
  capabilities: UserAdminCapabilities;
  onSaved: (patch: Partial<Pick<User, 'hasTwoFA' | 'twoFaMethod'>>) => void;
}>) {
  const { status, run } = useUserMutation();
  const busy = status === 'confirming' || status === 'saving';
  const canReset = hasAction(capabilities, 'resetTwoFa');

  const disable = () => {
    void run({
      confirm: {
        title: 'Disable 2FA',
        description: canReset
          ? 'This turns two-factor authentication off and deletes the authenticator secret and backup codes.'
          : 'This turns two-factor authentication off. The authenticator secret is kept, and the user re-enrolling replaces it.',
        actionText: 'Disable 2FA',
        variant: 'destructive',
      },
      perform: () =>
        canReset
          ? resetUserTwoFa(user._id)
          : updateUser(user._id, userPatch(user, { hasTwoFA: false })),
      success: { title: 'Two-factor authentication disabled' },
      failure: {
        title: 'Could not disable 2FA',
        description: failure => failure.message,
      },
      unsupportedOn404: canReset,
    }).then(outcome => {
      if (outcome.ok) onSaved({ hasTwoFA: false, twoFaMethod: '' });
    });
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="user-two-factor">
      <h3 id="user-two-factor" className="text-sm font-medium text-balance">
        Two-factor
      </h3>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-sm">{twoFaLabel(user)}</p>
        </div>
        {user.hasTwoFA && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={disable}
            disabled={busy}
          >
            Disable 2FA
          </Button>
        )}
      </div>
    </section>
  );
}
