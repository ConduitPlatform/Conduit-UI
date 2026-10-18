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
  addRealmGuests,
  addTeamMembers,
  getRealm,
  getUsers,
  patchTeamMembersRoles,
} from '@/lib/api/authentication';
import { getResourceDefinition } from '@/lib/api/authorization';
import {
  DEFAULT_MEMBER_ROLE,
  getPickerEligibility,
  type GuestPolicy,
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
  isRealmTeam = false,
  open,
  onOpenChange,
  onAdded,
  existingMemberIds,
}: Readonly<{
  teamId: string;
  /** The team is a realm: users are added as guests through the realm API. */
  isRealmTeam?: boolean;
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
  const [guestPolicy, setGuestPolicy] = useState<GuestPolicy | undefined>();
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [role, setRole] = useState(DEFAULT_MEMBER_ROLE);
  const [submitting, setSubmitting] = useState(false);

  const memberIds = useMemo(
    () => new Set(existingMemberIds ?? []),
    [existingMemberIds]
  );
  const eligibilityContext = useMemo(
    () => ({
      realmTeamId: isRealmTeam ? teamId : undefined,
      guestPolicy,
      memberIds,
    }),
    [isRealmTeam, teamId, guestPolicy, memberIds]
  );

  // Reset whenever the sheet closes so the next open starts clean.
  useEffect(() => {
    if (open) return;
    setSearch('');
    setSelected(new Map());
    setRole(DEFAULT_MEMBER_ROLE);
  }, [open]);

  // The realm's guest policy decides who can be offered.
  useEffect(() => {
    if (!open || !isRealmTeam) return;
    let cancelled = false;
    getRealm(teamId)
      .then(realm => {
        if (cancelled) return;
        const { guests } = realm.settings.policies;
        setGuestPolicy({
          allowed: guests.allowed,
          allowedHomeRealms: guests.allowedHomeRealms ?? [],
        });
      })
      .catch(() => {
        // Unknown policy: offer everybody and let the backend validate.
        if (!cancelled) setGuestPolicy(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [open, isRealmTeam, teamId]);

  // Roles come from the Team resource, the same source as the role dialog.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRolesError(null);
    getResourceDefinition(TEAM_RESOURCE_NAME)
      .then(def => {
        if (cancelled) return;
        const allowed = teamMemberRolesAllowedForUser(def);
        setAllowedRoles(allowed);
        if (allowed.length === 0) {
          setRolesError(
            'No roles are available; members get the default role.'
          );
          return;
        }
        setRole(r => (allowed.includes(r) ? r : (allowed[0] ?? r)));
      })
      .catch(() => {
        if (!cancelled) {
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

  const guestsDisallowed = isRealmTeam && guestPolicy?.allowed === false;
  const noun = isRealmTeam ? 'guest' : 'member';

  const handleSubmit = async () => {
    const picked = Array.from(selected.values());
    if (picked.length === 0) return;
    const ids = picked.map(user => user._id);
    setSubmitting(true);
    try {
      if (isRealmTeam) {
        await addRealmGuests(teamId, ids);
      } else {
        await addTeamMembers(teamId, picked);
      }
    } catch (e: unknown) {
      toast({
        title: `Failed to add ${noun}s`,
        description: e instanceof Error ? e.message : undefined,
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }
    let roleFailed = false;
    if (role !== DEFAULT_MEMBER_ROLE && allowedRoles.includes(role)) {
      try {
        await patchTeamMembersRoles(teamId, ids, role);
      } catch (e: unknown) {
        roleFailed = true;
        toast({
          title: 'Added, but the role could not be set',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        });
      }
    }
    if (!roleFailed) {
      toast({
        title:
          ids.length === 1
            ? `${isRealmTeam ? 'Guest' : 'Member'} added`
            : `${ids.length} ${noun}s added`,
      });
    }
    setSubmitting(false);
    onAdded?.();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isRealmTeam ? 'Add guest' : 'Add members'}</SheetTitle>
          <SheetDescription>
            {isRealmTeam
              ? 'Give existing users guest access to this realm.'
              : 'Pick existing users to add to this team.'}
          </SheetDescription>
        </SheetHeader>

        {guestsDisallowed && (
          <p
            role="note"
            className="rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-muted-foreground"
          >
            This realm does not accept guests. Only users without a home realm
            can be added; users who belong to another realm are disabled.
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
                      <Badge variant="outline">Guest</Badge>
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
              <SelectValue placeholder={DEFAULT_MEMBER_ROLE} />
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
            disabled={selected.size === 0 || submitting}
            className="inline-flex items-center gap-2"
          >
            {submitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {selected.size > 0
              ? `Add ${selected.size} ${noun}${selected.size === 1 ? '' : 's'}`
              : `Add ${noun}s`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
