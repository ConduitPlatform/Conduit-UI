'use client';
import { useState } from 'react';
import { Check, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAlerts } from '@/components/providers/AlertProvider';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';
import { updateRealm } from '@/lib/api/authentication';
import { formatRealmCounts } from '@/lib/authentication/realms';
import type { Realm } from '@/lib/models/Realm';
import { DemoteRealmDialog } from '@/components/authentication/teams/manageTeam/realm/DemoteRealmDialog';

/**
 * What a realm change does to people comes first: the user counts lead the strip,
 * followed by the kill-switch, the slug and the overflow menu.
 */
export function RealmStatusStrip({
  realm,
  onChange,
}: Readonly<{
  realm: Realm;
  onChange: (realm: Realm) => void;
}>) {
  const { addAlert } = useAlerts();
  const { save, isSaving } = useSettingsSave('Realm');
  const [demoteOpen, setDemoteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const slug = realm.team.realm?.slug ?? '';
  const { active } = realm.settings;
  const { counts } = realm;

  const setActive = async (next: boolean) => {
    const result = await save({
      successMessage: next ? 'Realm activated' : 'Realm deactivated',
      action: () => updateRealm(realm.team._id, { active: next }),
    });
    if (result.ok) onChange(result.result);
  };

  const onActiveChange = (next: boolean) => {
    if (next) {
      void setActive(true);
      return;
    }
    addAlert({
      title: `Deactivate realm ${slug}?`,
      description: `Nobody can sign in to or enter this realm until it is activated again. This affects ${formatRealmCounts(counts)}.`,
      cancelText: 'Cancel',
      actionText: 'Deactivate',
      onDecision: cancel => {
        if (!cancel) void setActive(false);
      },
    });
  };

  const copySlug = () => {
    navigator.clipboard
      .writeText(slug)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Clipboard access can be denied; nothing useful to show.
      });
  };

  return (
    <Card>
      <CardContent className="flex flex-row flex-wrap items-center justify-between gap-x-8 gap-y-3 pt-3">
        <div className="flex flex-row items-center gap-8">
          <Stat label="Home users" value={counts.home} />
          <Stat label="Guests" value={counts.guest} />
        </div>
        <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-row items-center gap-2">
            <span className="text-xs text-muted-foreground">Slug</span>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {slug}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Copy slug"
              onClick={copySlug}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label htmlFor="realm-active" className="text-sm font-medium">
              Active
            </Label>
            <Switch
              id="realm-active"
              checked={active}
              disabled={isSaving}
              onCheckedChange={onActiveChange}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Realm actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => setDemoteOpen(true)}
              >
                Demote realm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      {!active && (
        <p
          role="status"
          className="mx-3 mb-3 rounded-md bg-callout-warning-muted px-3 py-2 text-xs text-callout-warning-foreground"
        >
          This realm is inactive. Nobody can sign in to or enter it.
        </p>
      )}
      <DemoteRealmDialog
        open={demoteOpen}
        onOpenChange={setDemoteOpen}
        teamId={realm.team._id}
        slug={slug}
        counts={counts}
      />
    </Card>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-semibold tabular-nums leading-none">
        {value}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
