'use client';

import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getResourceDefinition } from '@/lib/api/authorization';
import { patchTeamMembersRoles } from '@/lib/api/authentication';
import { toast } from '@/lib/hooks/use-toast';
import type { TeamUser } from '@/lib/models/User';
import {
  TEAM_RESOURCE_NAME,
  teamMemberRolesAllowedForUser,
} from '@/lib/authorization/teamMemberRoles';

export function EditTeamMemberRoleDialog({
  teamId,
  user,
  onChanged,
}: Readonly<{
  teamId: string;
  user: TeamUser;
  onChanged: () => void;
}>) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(user.role);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetDialogState = () => {
    setAllowedRoles([]);
    setLoadError(null);
    setLoadingRoles(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetDialogState();
    }
  };

  const openDialog = () => {
    setOpen(true);
    setLoadError(null);
    setRole(user.role);
    setLoadingRoles(true);
    void getResourceDefinition(TEAM_RESOURCE_NAME)
      .then(def => {
        if (def == null) {
          setAllowedRoles([]);
          setLoadError(
            'Team resource definition was not found. Create a Team resource in Authorization.'
          );
          return;
        }
        const allowed = teamMemberRolesAllowedForUser(def);
        setAllowedRoles(allowed);
        if (allowed.length === 0) {
          setLoadError(
            'The Team resource has no relations that allow User subjects. Configure roles in Authorization (Team resource definition).'
          );
          return;
        }
        setRole(r => (allowed.includes(r) ? r : (allowed[0] ?? r)));
      })
      .catch(() => {
        setLoadError('Could not load the Team resource definition.');
      })
      .finally(() => setLoadingRoles(false));
  };

  const handleSubmit = async () => {
    if (loadError || allowedRoles.length === 0) return;
    if (role === user.role) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await patchTeamMembersRoles(teamId, [user._id], role);
      toast({ title: 'Role updated' });
      onChanged();
      setOpen(false);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({
        title: 'Failed to update role',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    !loadingRoles &&
    !loadError &&
    allowedRoles.length > 0 &&
    role !== user.role;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="sm"
        title="Change role"
        type="button"
        onClick={openDialog}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change member role</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {user.email ?? user._id}
        </p>
        <p className="text-xs text-muted-foreground">
          Roles come from the &quot;{TEAM_RESOURCE_NAME}&quot; resource
          definition (relations that allow User or *).
        </p>
        {loadingRoles ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading roles…
          </div>
        ) : loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : (
          <Select value={role} onValueChange={setRole} disabled={saving}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {allowedRoles.map(r => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
