'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAlerts } from '@/components/providers/AlertProvider';
import { HomeRealmCell } from '@/components/authentication/users/homeRealmCell';
import { getUsers, setUserHomeRealm } from '@/lib/api/authentication';
import {
  HOME_REALM_GLOBAL,
  homeRealmSelectionToTeamId,
  realmLabel,
} from '@/lib/authentication/realmMembers';
import { toast } from '@/lib/hooks/use-toast';
import type { User } from '@/lib/models/User';

/** Alert text for moving a user; it spells out what happens to their sessions. */
export function describeHomeRealmMove({
  email,
  from,
  to,
  force,
}: {
  email: string;
  from: string;
  to: string;
  force: boolean;
}): string {
  const sessions = force
    ? 'All of their sessions will be revoked and they will be signed out everywhere.'
    : 'Their current sessions are not revoked and stay valid until they expire.';
  return `${email} will sign in at ${to} instead of ${from}. ${sessions}`;
}

export function EditUserSheet({
  userId,
  user: initialUser,
  open,
  onOpenChange,
  realmSlugs,
}: Readonly<{
  userId: string;
  /** The row the sheet was opened from. Fetched by id when absent. */
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  realmSlugs: ReadonlyMap<string, string>;
}>) {
  const router = useRouter();
  const { addAlert } = useAlerts();
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [target, setTarget] = useState(
    initialUser?.homeRealm ?? HOME_REALM_GLOBAL
  );
  const [force, setForce] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (initialUser) return;
    let cancelled = false;
    getUsers(0, 5, { search: userId })
      .then(data => {
        const found = data.users.find(u => u._id === userId);
        if (cancelled || !found) return;
        setUser(found);
        setTarget(found.homeRealm ?? HOME_REALM_GLOBAL);
      })
      .catch(() => {
        // The sheet stays usable with the id only.
      });
    return () => {
      cancelled = true;
    };
  }, [initialUser, userId]);

  const current = user?.homeRealm ?? HOME_REALM_GLOBAL;
  const options = useMemo(
    () => [
      { value: HOME_REALM_GLOBAL, label: 'Global' },
      ...Array.from(realmSlugs, ([id, slug]) => ({ value: id, label: slug })),
    ],
    [realmSlugs]
  );
  const labelOf = (value: string) =>
    value === HOME_REALM_GLOBAL ? 'Global' : realmLabel(value, realmSlugs);
  const email = user?.email ?? userId;

  const move = async () => {
    setMoving(true);
    try {
      const updated = await setUserHomeRealm(
        userId,
        homeRealmSelectionToTeamId(target),
        force
      );
      setUser(prev => ({
        ...(prev ?? ({ _id: userId } as User)),
        ...updated,
        homeRealm: updated?.homeRealm ?? homeRealmSelectionToTeamId(target),
      }));
      setForce(false);
      toast({
        title: 'Home realm moved',
        description: force
          ? `${email} now belongs to ${labelOf(target)} and was signed out everywhere.`
          : `${email} now belongs to ${labelOf(target)}.`,
      });
      router.refresh();
    } catch (e: unknown) {
      toast({
        title: 'Failed to move home realm',
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setMoving(false);
    }
  };

  const confirmMove = () => {
    addAlert({
      title: 'Move home realm',
      description: describeHomeRealmMove({
        email,
        from: labelOf(current),
        to: labelOf(target),
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription>{email}</SheetDescription>
        </SheetHeader>

        <section className="flex flex-col gap-3" aria-labelledby="user-realms">
          <h3 id="user-realms" className="text-sm font-medium">
            Realms
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Home realm</span>
            <HomeRealmCell
              homeRealm={user?.homeRealm}
              realmSlugs={realmSlugs}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Guest memberships are managed from each realm&apos;s Members tab.{' '}
            <Link
              href="/authentication/teams?realm=true"
              className="underline underline-offset-2"
            >
              Go to Teams
            </Link>
          </p>
        </section>

        <section
          className="flex flex-col gap-3"
          aria-labelledby="user-move-realm"
        >
          <h3 id="user-move-realm" className="text-sm font-medium">
            Move home realm
          </h3>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-home-realm-target">New home realm</Label>
            <Select value={target} onValueChange={setTarget} disabled={moving}>
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
              disabled={moving}
            />
            <Label htmlFor="user-home-realm-force" className="font-normal">
              Also sign the user out everywhere
            </Label>
          </div>
          <Button
            type="button"
            className="self-start"
            onClick={confirmMove}
            disabled={moving || target === current}
          >
            {moving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            )}
            Move home realm
          </Button>
        </section>
      </SheetContent>
    </Sheet>
  );
}
