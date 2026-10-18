'use client';
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  addTeamMembers,
  getTeamMembers,
  getUsers,
  patchTeamMembersRoles,
} from '@/lib/api/authentication';
import { getResourceDefinition } from '@/lib/api/authorization';
import {
  DEFAULT_MEMBER_ROLE,
  getPickerEligibility,
  interpretMembershipLookup,
  isCandidateEligible,
  type GuestPolicy,
  type MembershipLookup,
} from '@/lib/authentication/realmMembers';
import {
  TEAM_RESOURCE_NAME,
  teamMemberRolesAllowedForUser,
} from '@/lib/authorization/teamMemberRoles';
import { toast } from '@/lib/hooks/use-toast';
import type { User } from '@/lib/models/User';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function AddMemberSheet({
  teamId,
  realmTeamId,
  guestPolicy,
  open,
  onOpenChange,
  onAdded,
  existingMemberIds,
}: Readonly<{
  teamId: string;
  /**
   * The realm the team belongs to (the team itself or its top-most ancestor). The
   * backend makes users without a home realm home users of it and the others guests.
   */
  realmTeamId?: string;
  /** The realm's `policies.guests`; unknown leaves the decision to the backend. */
  guestPolicy?: GuestPolicy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
  /** Users already shown as members; they cannot be picked again. */
  existingMemberIds?: readonly string[];
}>) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selected, setSelected] = useState<Map<string, User>>(new Map());
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [rolesReady, setRolesReady] = useState(false);
  // Empty until the roles are known; `member` is preselected only when it is allowed.
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const memberIds = useMemo(
    () => new Set(existingMemberIds ?? []),
    [existingMemberIds]
  );
  const eligibilityContext = useMemo(
    () => ({
      realmTeamId,
      guests: guestPolicy,
      existingMemberIds: memberIds,
    }),
    [realmTeamId, guestPolicy, memberIds]
  );

  // Reset whenever the sheet closes so the next open starts clean.
  useEffect(() => {
    if (open) return;
    setSearch('');
    setSelected(new Map());
    setRole('');
  }, [open]);

  // Roles come from the Team resource, the same source as the role dialog.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRolesError(null);
    setRolesReady(false);
    getResourceDefinition(TEAM_RESOURCE_NAME)
      .then(def => {
        if (cancelled) return;
        setRolesReady(true);
        const allowed = teamMemberRolesAllowedForUser(def);
        setAllowedRoles(allowed);
        if (allowed.length === 0) {
          setRolesError(
            'No roles are available; members get the default role.'
          );
          return;
        }
        setRole(r =>
          allowed.includes(r)
            ? r
            : allowed.includes(DEFAULT_MEMBER_ROLE)
              ? DEFAULT_MEMBER_ROLE
              : ''
        );
      })
      .catch(() => {
        if (!cancelled) {
          setRolesReady(true);
          setRolesError('Could not load roles; members get the default role.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingUsers(true);
    getUsers(0, PAGE_SIZE, debouncedSearch ? { search: debouncedSearch } : {})
      .then(data => {
        if (!cancelled) setUsers(data.users);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setUsers([]);
        toast({
          title: 'Failed to load users',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch]);

  const toggle = (user: User, checked: boolean) => {
    setSelected(prev => {
      const next = new Map(prev);
      if (checked) next.set(user._id, user);
      else next.delete(user._id);
      return next;
    });
  };

  const guestsDisallowed =
    realmTeamId !== undefined && guestPolicy?.allowed === false;
  // Roles are known but none is chosen (`member` is not offered): ask explicitly.
  const roleRequired = allowedRoles.length > 0 && role === '';

  /**
   * Which of `ids` are members already. Members on other pages are not in
   * `existingMemberIds`, and re-granting them would reset their role, so each id is
   * looked up through the members search (24-hex ids only; see `interpretMembershipLookup`).
   */
  const lookupMemberships = async (ids: string[]) => {
    const entries = await Promise.all(
      ids.map(async (id): Promise<[string, MembershipLookup]> => {
        try {
          const found = await getTeamMembers(teamId, 0, 1, { search: id });
          return [id, interpretMembershipLookup(id, found)];
        } catch {
          return [id, 'unknown'];
        }
      })
    );
    return new Map(entries);
  };

  const handleSubmit = async () => {
    // Eligibility is judged again here: the team or the policy may have changed
    // since the rows were ticked.
    const picked = Array.from(selected.values()).filter(user =>
      isCandidateEligible(user, eligibilityContext)
    );
    const dropped = selected.size - picked.length;
    if (picked.length === 0) {
      if (dropped > 0) {
        toast({
          title: 'Nobody to add',
          description: `${dropped} selected user${dropped === 1 ? ' is' : 's are'} no longer eligible.`,
          variant: 'destructive',
        });
      }
      return;
    }
    setSubmitting(true);
    try {
      const wantsRole =
        role !== '' &&
        role !== DEFAULT_MEMBER_ROLE &&
        allowedRoles.includes(role);
      const lookups = await lookupMemberships(picked.map(user => user._id));
      const toAdd = picked.filter(user => lookups.get(user._id) !== 'existing');
      const existingCount = picked.length - toAdd.length;

      if (toAdd.length > 0) {
        const added = await addTeamMembers(teamId, toAdd);
        if (!added.ok) {
          toast({
            title: 'Failed to add members',
            description: added.message,
            variant: 'destructive',
          });
          return;
        }
      }

      // Only users confirmed as new get the chosen role.
      const newIds = toAdd
        .map(user => user._id)
        .filter(id => lookups.get(id) === 'new');
      const unverified = toAdd.length - newIds.length;
      let roleFailed = false;
      if (wantsRole && newIds.length > 0) {
        const patched = await patchTeamMembersRoles(teamId, newIds, role);
        if (!patched.ok) {
          roleFailed = true;
          toast({
            title: 'Added, but the role could not be set',
            description: patched.message,
            variant: 'destructive',
          });
        }
      }
      if (wantsRole && existingCount + unverified > 0) {
        const skipped = existingCount + unverified;
        toast({
          title: `Role not changed for ${skipped} existing member${skipped === 1 ? '' : 's'}`,
          description:
            unverified > 0
              ? `${unverified} could not be confirmed as new. Use the role editor to change their role.`
              : 'Use the role editor to change their role.',
        });
      }
      if (!roleFailed) {
        if (toAdd.length === 0) {
          toast({ title: 'Everybody selected is a member already' });
        } else {
          toast({
            title:
              toAdd.length === 1
                ? 'Member added'
                : `${toAdd.length} members added`,
          });
        }
      }
      onAdded?.();
      onOpenChange(false);
    } catch (e: unknown) {
      toast({
        title: 'Failed to add members',
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add members</SheetTitle>
          <SheetDescription>
            {realmTeamId
              ? 'Pick existing users to add to this team. Users without a home realm become home users of the realm; users from another realm join as guests.'
              : 'Pick existing users to add to this team.'}
          </SheetDescription>
        </SheetHeader>

        {guestsDisallowed && (
          <p
            role="note"
            className="rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-muted-foreground"
          >
            This realm does not accept guests. Users without a home realm can be
            added; users who belong to another realm are disabled.
          </p>
        )}

        <Input
          placeholder="Search by email or id"
          aria-label="Search users"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div
          className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border"
          aria-busy={loadingUsers}
        >
          {users.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {loadingUsers ? 'Loading users…' : 'No users found.'}
            </p>
          ) : (
            <ul>
              {users.map(user => {
                const eligibility = getPickerEligibility(
                  user,
                  eligibilityContext
                );
                const id = `add-member-${user._id}`;
                return (
                  <li
                    key={user._id}
                    className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
                  >
                    <Checkbox
                      id={id}
                      checked={selected.has(user._id)}
                      disabled={!eligibility.selectable || submitting}
                      onCheckedChange={checked =>
                        toggle(user, checked === true)
                      }
                    />
                    <Label
                      htmlFor={id}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 font-normal"
                    >
                      <span className="truncate text-sm">
                        {user.email || user._id}
                      </span>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {user._id}
                      </span>
                    </Label>
                    {eligibility.hint === 'guest' && (
                      <Badge variant="outline">Will join as guest</Badge>
                    )}
                    {eligibility.reason && (
                      <span className="text-xs text-muted-foreground">
                        {eligibility.reason}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-member-role">Role</Label>
          <Select
            value={role}
            onValueChange={setRole}
            disabled={submitting || allowedRoles.length === 0}
          >
            <SelectTrigger id="add-member-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {allowedRoles.map(r => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {rolesError && (
            <p className="text-xs text-muted-foreground">{rolesError}</p>
          )}
          {roleRequired && (
            <p className="text-xs text-muted-foreground">
              Choose a role for the new members.
            </p>
          )}
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              selected.size === 0 || submitting || !rolesReady || roleRequired
            }
            className="inline-flex items-center gap-2"
          >
            {submitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {selected.size > 0
              ? `Add ${selected.size} member${selected.size === 1 ? '' : 's'}`
              : 'Add members'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
