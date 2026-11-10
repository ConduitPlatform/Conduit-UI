'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlerts } from '@/components/providers/AlertProvider';
import { HomeRealmCell } from '@/components/authentication/users/homeRealmCell';
import {
  getUserRealms,
  removeRealmGuest,
  setUserHomeRealm,
} from '@/lib/api/authentication';
import { describeHomeRealmMove } from '@/lib/authentication/homeRealmMove';
import {
  HOME_REALM_GLOBAL,
  homeRealmSelectionToTeamId,
  realmLabel,
} from '@/lib/authentication/realmMembers';
import { toast } from '@/lib/hooks/use-toast';
import type { UserRealms } from '@/lib/models/Realm';
import type { User } from '@/lib/models/User';

type MoveStatus = 'idle' | 'saving';
type UnlinkStatus = { kind: 'idle' } | { kind: 'saving'; teamId: string };
type RealmsStatus = 'loading' | 'loaded' | 'error';

export function RealmSections({
  userId,
  user,
  lookup,
  realmSlugs,
}: Readonly<{
  userId: string;
  user?: User;
  lookup: 'loading' | 'loaded' | 'error';
  realmSlugs: ReadonlyMap<string, string>;
}>) {
  const router = useRouter();
  const { addAlert } = useAlerts();
  const [target, setTarget] = useState(user?.homeRealm ?? HOME_REALM_GLOBAL);
  const [homeOverride, setHomeOverride] = useState<string | null | undefined>(
    undefined
  );
  const [force, setForce] = useState(false);
  const [moveStatus, setMoveStatus] = useState<MoveStatus>('idle');
  const [realms, setRealms] = useState<UserRealms | undefined>(undefined);
  const [realmsStatus, setRealmsStatus] = useState<RealmsStatus>('loading');
  const [unlinkStatus, setUnlinkStatus] = useState<UnlinkStatus>({
    kind: 'idle',
  });
  const userKey = user?._id;
  const propHome = user?.homeRealm ?? null;

  useEffect(() => {
    setTarget(propHome ?? HOME_REALM_GLOBAL);
    setHomeOverride(undefined);
  }, [propHome, userKey]);

  const loadRealms = useCallback(async () => {
    setRealmsStatus('loading');
    const result = await getUserRealms(userId);
    if (!result.ok) {
      setRealmsStatus('error');
      return;
    }
    setRealms(result.data);
    setRealmsStatus('loaded');
  }, [userId]);

  useEffect(() => {
    void loadRealms();
  }, [loadRealms]);

  const homeRealm = homeOverride !== undefined ? homeOverride : propHome;
  const current = homeRealm ? homeRealm : HOME_REALM_GLOBAL;
  const options = useMemo(
    () => [
      { value: HOME_REALM_GLOBAL, label: 'Global' },
      ...Array.from(realmSlugs, ([id, slug]) => ({ value: id, label: slug })),
    ],
    [realmSlugs]
  );
  const labelOf = (value: string) =>
    value === HOME_REALM_GLOBAL ? 'Global' : realmLabel(value, realmSlugs);
  const scopeOf = (value: string) =>
    value === HOME_REALM_GLOBAL ? null : realmLabel(value, realmSlugs);
  const email = user?.email ?? userId;
  const linkedRealms =
    realms?.guests.filter(guest => guest._id !== realms.home?._id) ?? [];
  const moving = moveStatus === 'saving';

  const move = async () => {
    setMoveStatus('saving');
    try {
      const result = await setUserHomeRealm(
        userId,
        homeRealmSelectionToTeamId(target),
        force
      );
      if (!result.ok) {
        toast({
          title: 'Failed to move home realm',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }
      setHomeOverride(homeRealmSelectionToTeamId(target));
      setForce(false);
      toast({
        title: 'Home realm moved',
        description: force
          ? `${email} now belongs to ${labelOf(target)} and was signed out everywhere.`
          : `${email} now belongs to ${labelOf(target)}.`,
      });
      await loadRealms();
      router.refresh();
    } catch (error: unknown) {
      toast({
        title: 'Failed to move home realm',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setMoveStatus('idle');
    }
  };

  const unlink = async (guest: UserRealms['guests'][number]) => {
    setUnlinkStatus({ kind: 'saving', teamId: guest._id });
    try {
      const result = await removeRealmGuest(guest._id, userId);
      if (result.ok) {
        toast({
          title: 'Realm unlinked',
          description: `${email} was unlinked from ${guest.slug}.`,
        });
      } else {
        toast({
          title: 'Failed to unlink realm',
          description: result.message,
          variant: 'destructive',
        });
      }
      await loadRealms();
    } finally {
      setUnlinkStatus({ kind: 'idle' });
    }
  };

  const confirmUnlink = (guest: UserRealms['guests'][number]) => {
    addAlert({
      title: 'Unlink realm',
      description: `${email} will no longer be able to sign in at ${guest.slug}. Sessions at ${guest.slug} end.`,
      cancelText: 'Cancel',
      actionText: 'Unlink',
      onDecision: cancel => {
        if (!cancel) void unlink(guest);
      },
    });
  };

  const confirmMove = () => {
    addAlert({
      title: 'Move home realm',
      description: describeHomeRealmMove({
        email,
        from: scopeOf(current),
        to: scopeOf(target),
        force,
      }),
      cancelText: 'Cancel',
      actionText: force ? 'Move and sign out' : 'Move',
      onDecision: cancel => {
        if (!cancel) void move();
      },
    });
  };

  return (
    <>
      <section className="flex flex-col gap-3" aria-labelledby="user-realms">
        <h3 id="user-realms" className="text-sm font-medium text-balance">
          Realms
        </h3>
        {realmsStatus === 'loading' && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading realms…
          </p>
        )}
        {realmsStatus === 'error' && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 text-sm text-destructive"
          >
            <span>Linked realms could not be loaded.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadRealms()}
            >
              Retry
            </Button>
          </div>
        )}
        {realmsStatus !== 'loading' && (
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            <li className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Home realm</span>
              {realmsStatus === 'loaded' && realms ? (
                realms.home ? (
                  <span
                    className="inline-flex items-center rounded-full bg-callout-info-muted px-2.5 py-0.5 font-mono text-xs font-medium text-callout-info-foreground"
                    title="Home realm"
                  >
                    {realms.home.slug}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Global</span>
                )
              ) : (
                user && (
                  <HomeRealmCell
                    homeRealm={user.homeRealm}
                    realmSlugs={realmSlugs}
                  />
                )
              )}
            </li>
            {linkedRealms.map(guest => (
              <li
                key={guest._id}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">Linked</span>
                  <span className="font-mono text-xs">{guest.slug}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Unlink ${guest.slug}`}
                  disabled={unlinkStatus.kind === 'saving'}
                  onClick={() => confirmUnlink(guest)}
                >
                  {unlinkStatus.kind === 'saving' &&
                    unlinkStatus.teamId === guest._id && (
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden
                      />
                    )}
                  Unlink
                </Button>
              </li>
            ))}
            {realmsStatus === 'loaded' && linkedRealms.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Not linked to any other realm.
              </li>
            )}
          </ul>
        )}
      </section>

      <section
        className="flex flex-col gap-3"
        aria-labelledby="user-move-realm"
      >
        <h3 id="user-move-realm" className="text-sm font-medium text-balance">
          Move home realm
        </h3>
        {lookup === 'loading' && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading user…
          </p>
        )}
        {lookup === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            Could not load this user, so their home realm cannot be moved from
            here. Close the sheet and try again.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="user-home-realm-target">New home realm</Label>
          <Select
            value={target}
            onValueChange={setTarget}
            disabled={moving || !user}
          >
            <SelectTrigger id="user-home-realm-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="user-home-realm-force"
            checked={force}
            onCheckedChange={checked => setForce(checked === true)}
            disabled={moving || !user}
          />
          <Label htmlFor="user-home-realm-force" className="font-normal">
            Also sign the user out everywhere
          </Label>
        </div>
        <Button
          type="button"
          className="self-start"
          onClick={confirmMove}
          disabled={moving || !user || target === current}
        >
          {moving && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          )}
          Move home realm
        </Button>
      </section>
    </>
  );
}
