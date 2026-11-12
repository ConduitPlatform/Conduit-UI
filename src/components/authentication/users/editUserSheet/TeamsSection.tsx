'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUserMutation } from '@/components/authentication/users/useUserMutation';
import { useUserTeams } from '@/components/authentication/users/useUserTeams';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  addTeamMemberIds,
  getTeams,
  patchTeamMembersRoles,
  removeTeamMembers,
} from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';
import type { Team } from '@/lib/models/Team';
import type { UserTeamMembership } from '@/lib/models/User';

type MemberStatus =
  | { kind: 'idle' }
  | { kind: 'saving'; teamId: string }
  | { kind: 'error'; teamId: string; message: string };

function membershipLabel(team: UserTeamMembership): string | undefined {
  if (team.membershipType === 'home') return 'Home';
  if (team.membershipType === 'guest') return 'Guest';
  return undefined;
}

export function TeamsSection({ userId }: Readonly<{ userId: string }>) {
  const { status, teams, count, roles, message, reload } = useUserTeams(
    userId,
    true
  );
  const { run } = useUserMutation();
  const [memberStatus, setMemberStatus] = useState<MemberStatus>({
    kind: 'idle',
  });
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [found, setFound] = useState<Team[]>([]);
  const [lookup, setLookup] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  );
  const [chosenRole, setChosenRole] = useState<string | undefined>();
  const role =
    chosenRole && roles.includes(chosenRole)
      ? chosenRole
      : roles.includes('member')
        ? 'member'
        : roles[0];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!addOpen) return;
    let cancelled = false;
    setLookup('loading');
    getTeams(0, 20, { search: debouncedSearch || undefined })
      .then(result => {
        if (cancelled) return;
        setFound(result.teams);
        setLookup('ready');
      })
      .catch(() => {
        if (!cancelled) setLookup('error');
      });
    return () => {
      cancelled = true;
    };
  }, [addOpen, debouncedSearch]);

  const changeRole = async (team: UserTeamMembership, nextRole: string) => {
    setMemberStatus({ kind: 'saving', teamId: team._id });
    const result = await patchTeamMembersRoles(team._id, [userId], nextRole);
    if (!result.ok) {
      setMemberStatus({
        kind: 'error',
        teamId: team._id,
        message: result.message,
      });
      return;
    }
    setMemberStatus({ kind: 'idle' });
    toast({
      title: 'Role updated',
      description: `${team.name} is now ${nextRole}.`,
    });
    reload();
  };

  const remove = (team: UserTeamMembership) => {
    void run({
      confirm: {
        title: 'Remove from team',
        description: `Remove this user from ${team.name}?`,
        actionText: 'Remove',
        variant: 'destructive',
      },
      perform: () => removeTeamMembers(team._id, [userId]),
      success: {
        title: 'Removed from team',
        description: `No longer a member of ${team.name}.`,
      },
      failure: {
        title: 'Could not remove team member',
        description: failure => failure.message,
      },
    }).then(outcome => {
      if (outcome.ok) reload();
    });
  };

  const add = async (team: Team) => {
    setAddOpen(false);
    setMemberStatus({ kind: 'saving', teamId: team._id });
    const added = await addTeamMemberIds(team._id, [userId]);
    if (!added.ok) {
      setMemberStatus({
        kind: 'error',
        teamId: team._id,
        message: added.message,
      });
      toast({
        title: 'Could not add to team',
        description: added.message,
        variant: 'destructive',
      });
      return;
    }
    if (role && role !== 'member') {
      const patched = await patchTeamMembersRoles(team._id, [userId], role);
      if (!patched.ok) {
        setMemberStatus({
          kind: 'error',
          teamId: team._id,
          message: patched.message,
        });
        reload();
        return;
      }
    }
    setMemberStatus({ kind: 'idle' });
    toast({ title: 'Added to team', description: team.name });
    reload();
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="user-teams">
      <h3 id="user-teams" className="text-sm font-medium text-balance">
        Teams
      </h3>
      {status === 'loading' && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading teams…
        </p>
      )}
      {status === 'error' && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 text-sm text-destructive"
        >
          <span>{message ?? 'Teams could not be loaded.'}</span>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            Retry
          </Button>
        </div>
      )}
      {status === 'ready' && teams.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Not a member of any team.
        </p>
      )}
      {status === 'ready' && teams.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {teams.map(team => {
            const current =
              team.roles.find(item => roles.includes(item)) ?? team.roles[0];
            const label = membershipLabel(team);
            const saving =
              memberStatus.kind === 'saving' &&
              memberStatus.teamId === team._id;
            return (
              <li
                key={team._id}
                className="flex flex-col gap-2 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate font-medium">
                    {team.name}
                  </span>
                  {label && (
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={current}
                    onValueChange={value => void changeRole(team, value)}
                    disabled={roles.length === 0 || saving}
                  >
                    <SelectTrigger aria-label={`Role in ${team.name}`}>
                      <SelectValue placeholder={current || 'Role'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(roles.length > 0 ? roles : team.roles).map(item => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(team)}
                    disabled={saving}
                  >
                    Remove
                  </Button>
                </div>
                {memberStatus.kind === 'error' &&
                  memberStatus.teamId === team._id && (
                    <p role="alert" className="text-sm text-destructive">
                      {memberStatus.message}
                    </p>
                  )}
              </li>
            );
          })}
        </ul>
      )}
      {status === 'ready' && count > teams.length && (
        <p className="text-pretty text-xs text-muted-foreground">
          Showing the first {teams.length} of {count} teams.
        </p>
      )}
      {roles.length === 0 && status === 'ready' && (
        <p className="text-pretty text-xs text-muted-foreground">
          The Team resource has no relations that allow User subjects.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {roles.length > 0 && (
          <Select value={role} onValueChange={setChosenRole}>
            <SelectTrigger className="w-32" aria-label="Role for the new team">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map(item => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Add to team
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search teams"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {lookup === 'loading' && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Searching…
                  </p>
                )}
                {lookup === 'error' && (
                  <p
                    className="px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    Teams could not be searched.
                  </p>
                )}
                {lookup === 'ready' && found.length === 0 && (
                  <CommandEmpty>No teams found.</CommandEmpty>
                )}
                <CommandGroup>
                  {found.map(team => (
                    <CommandItem
                      key={team._id}
                      value={team._id}
                      onSelect={() => void add(team)}
                    >
                      {team.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {memberStatus.kind === 'error' &&
        !teams.some(team => team._id === memberStatus.teamId) && (
          <p role="alert" className="text-sm text-destructive">
            {memberStatus.message}
          </p>
        )}
    </section>
  );
}
