'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorPre } from '@/components/ui/error-pre';
import { toast } from '@/lib/hooks/use-toast';
import { demoteRealm } from '@/lib/api/authentication';
import { formatRealmCounts } from '@/lib/authentication/realms';
import type { RealmCounts } from '@/lib/models/Realm';

type Stage = 'confirm' | 'force';

/**
 * Demotes a realm back to a regular team. The first attempt is made without `force`;
 * when home users still exist the backend refuses (REALM_HAS_HOME_USERS, 412) and the
 * dialog moves to the force path, which needs the slug typed to confirm.
 */
export function DemoteRealmDialog({
  open,
  onOpenChange,
  teamId,
  slug,
  counts,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  slug: string;
  counts: RealmCounts;
}>) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('confirm');
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (pending) return;
    if (!next) {
      setStage('confirm');
      setTyped('');
    }
    onOpenChange(next);
  };

  const run = async (force: boolean) => {
    setPending(true);
    try {
      const result = await demoteRealm(teamId, force);
      if (!result.ok) {
        // Home users exist: offer the force path instead of failing.
        setStage('force');
        return;
      }
      toast({
        title: 'Realm demoted',
        description:
          result.blockedUsers > 0
            ? `${slug} is a regular team again. ${result.blockedUsers} ${
                result.blockedUsers === 1 ? 'user was' : 'users were'
              } blocked.`
            : `${slug} is a regular team again.`,
      });
      handleOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Failed to demote realm',
        description: (
          <ErrorPre>
            {error instanceof Error ? error.message : String(error)}
          </ErrorPre>
        ),
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {stage === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle>Demote realm {slug}?</DialogTitle>
              <DialogDescription>
                The team becomes a regular team again. The realm&apos;s sign-in
                methods and policies are deleted, and its guest memberships are
                removed. Currently {formatRealmCounts(counts)}.
              </DialogDescription>
            </DialogHeader>
            {counts.home > 0 && (
              <p className="text-sm text-muted-foreground">
                Home users cannot be demoted along with the realm, so the next
                step asks you to confirm blocking them.
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => run(false)}
              >
                Demote realm
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                Block {counts.home} home {counts.home === 1 ? 'user' : 'users'}?
              </DialogTitle>
              <DialogDescription>
                {slug} still has home users. Forcing the demotion blocks them:
                they are signed out everywhere and cannot sign in again. They
                are not turned into global users. {counts.guest}{' '}
                {counts.guest === 1
                  ? 'guest membership is'
                  : 'guest memberships are'}{' '}
                removed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="demote-realm-confirm">
                Type <span className="font-mono font-semibold">{slug}</span> to
                confirm
              </Label>
              <Input
                id="demote-realm-confirm"
                value={typed}
                autoComplete="off"
                onChange={e => setTyped(e.target.value)}
                placeholder={slug}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={pending || typed !== slug}
                onClick={() => run(true)}
              >
                Block {counts.home} {counts.home === 1 ? 'user' : 'users'} and
                demote
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
