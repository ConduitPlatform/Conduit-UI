'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AccountSection } from '@/components/authentication/users/editUserSheet/AccountSection';
import { PasswordSection } from '@/components/authentication/users/editUserSheet/PasswordSection';
import { RealmSections } from '@/components/authentication/users/editUserSheet/RealmSections';
import { TeamsSection } from '@/components/authentication/users/editUserSheet/TeamsSection';
import { TwoFactorSection } from '@/components/authentication/users/editUserSheet/TwoFactorSection';
import { useSetUserVerified } from '@/components/authentication/users/useSetUserVerified';
import { useUserById } from '@/components/authentication/users/useUserById';
import {
  hasAction,
  LEGACY_CAPABILITIES,
  type UserAdminCapabilities,
} from '@/lib/authentication/userCapabilities';
import type { User } from '@/lib/models/User';

type SavedFields = Partial<
  Pick<
    User,
    'email' | 'isVerified' | 'hasTwoFA' | 'twoFaMethod' | 'phoneNumber'
  >
>;

type VerificationStatus = 'idle' | 'saving';

export function EditUserSheet({
  userId,
  user: userProp,
  open,
  onOpenChange,
  realmSlugs,
  realmsEnabled = true,
  capabilities = LEGACY_CAPABILITIES,
  teamsEnabled = false,
  bulkRunning = false,
}: Readonly<{
  userId: string;
  /** The row the sheet was opened from. Fetched by id when absent. */
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  realmSlugs: ReadonlyMap<string, string>;
  realmsEnabled?: boolean;
  capabilities?: UserAdminCapabilities;
  teamsEnabled?: boolean;
  bulkRunning?: boolean;
}>) {
  const lookup = useUserById(userId, userProp);
  const setUserVerified = useSetUserVerified(capabilities);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('idle');
  const source = lookup.user;
  const sourceKey = source
    ? `${source._id}:${String(source.updatedAt)}:${source.email}:${source.isVerified}:${source.phoneNumber ?? ''}:${source.hasTwoFA}`
    : '';
  const [overrideKey, setOverrideKey] = useState(sourceKey);
  const [overrides, setOverrides] = useState<SavedFields>({});
  if (overrideKey !== sourceKey) {
    setOverrideKey(sourceKey);
    setOverrides({});
  }
  const user = source ? { ...source, ...overrides } : undefined;
  const email = user?.email || userId;
  const showTeams =
    teamsEnabled && hasAction(capabilities, 'userTeams') && user !== undefined;

  const save = (patch: SavedFields) => {
    setOverrides(current => ({ ...current, ...patch }));
  };

  const changeVerification = (isVerified: boolean) => {
    if (
      !user ||
      user.isVerified === isVerified ||
      verificationStatus === 'saving'
    ) {
      return;
    }
    setVerificationStatus('saving');
    void setUserVerified(user, isVerified)
      .then(saved => {
        if (saved) save({ isVerified });
      })
      .finally(() => setVerificationStatus('idle'));
  };

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next && bulkRunning) return;
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="flex flex-col gap-6 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="text-balance">Edit user</SheetTitle>
          <SheetDescription className="text-pretty">{email}</SheetDescription>
        </SheetHeader>

        {user && (
          <AccountSection
            user={user}
            capabilities={capabilities}
            onSaved={save}
          />
        )}

        <section
          className="flex flex-col gap-3"
          aria-labelledby="user-verification"
        >
          <h3
            id="user-verification"
            className="text-sm font-medium text-balance"
          >
            Verification
          </h3>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="user-verified">Verified</Label>
              <p
                id="user-verified-hint"
                className="text-pretty text-sm text-muted-foreground"
              >
                The account email is confirmed.
              </p>
            </div>
            <Switch
              id="user-verified"
              checked={user?.isVerified === true}
              disabled={!user || verificationStatus === 'saving'}
              aria-describedby="user-verified-hint"
              onCheckedChange={checked => changeVerification(checked === true)}
            />
          </div>
        </section>

        {user && (
          <TwoFactorSection
            user={user}
            capabilities={capabilities}
            onSaved={save}
          />
        )}
        {user && <PasswordSection user={user} capabilities={capabilities} />}
        {showTeams && <TeamsSection userId={userId} />}
        {realmsEnabled && (
          <RealmSections
            userId={userId}
            user={user}
            lookup={user ? 'loaded' : lookup.status}
            realmSlugs={realmSlugs}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
