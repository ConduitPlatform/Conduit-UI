import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getStatusLabel, getStatusDotClasses } from '@/lib/status';
import type { ResolvedModuleState } from '@/lib/prometheus/metrics';
import {
  Users,
  Database,
  HardDrive,
  MessageSquare,
  CreditCard,
  Router,
  CloudIcon,
  FunctionSquare,
  Mail,
  Smartphone,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

const MODULE_ICONS: Record<string, typeof Users> = {
  authentication: Users,
  authorization: KeyRound,
  database: Database,
  email: Mail,
  storage: HardDrive,
  functions: FunctionSquare,
  chat: MessageSquare,
  payments: CreditCard,
  router: Router,
  pushNotifications: CloudIcon,
  sms: Smartphone,
};

interface ActiveModuleGridProps {
  resolvedStates: ResolvedModuleState[];
}

export function ActiveModuleGrid({
  resolvedStates,
}: Readonly<ActiveModuleGridProps>) {
  const visible = resolvedStates.filter(s => s.deployed || s.vanished);

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center space-y-2">
        <p className="text-[13px] text-muted-foreground">
          No modules available.
        </p>
        <Link
          href="/settings"
          className="inline-block text-[13px] font-medium text-primary hover:underline"
        >
          Configure modules
        </Link>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-foreground mb-2">
        Modules
      </h2>
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visible.map(mod => {
          const Icon = MODULE_ICONS[mod.iconName] ?? Database;
          const interactive = mod.serving || mod.vanished;

          let statusLabel: string;
          if (mod.vanished) {
            statusLabel = 'Missing';
          } else if (mod.deployed && !mod.serving) {
            statusLabel = 'Needs config';
          } else {
            statusLabel = getStatusLabel(mod.health);
          }

          return (
            <Link key={mod.iconName} href={mod.href}>
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border border-border bg-surface-1 px-3 py-2.5 transition-colors duration-100',
                  interactive
                    ? 'hover:border-primary/30 hover:bg-[hsl(224_14%_11%)]'
                    : 'opacity-45 cursor-default'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted shrink-0">
                    {mod.vanished ? (
                      <AlertTriangle className="size-3.5 text-status-critical" />
                    ) : (
                      <Icon className="size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-[13px] font-medium truncate">
                    {mod.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {mod.serving && mod.requests && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {mod.requests}
                    </span>
                  )}
                  {!mod.serving && !mod.vanished && (
                    <span className="text-[11px] text-muted-foreground">
                      {statusLabel}
                    </span>
                  )}
                  {mod.vanished && (
                    <span className="text-[11px] text-status-critical font-medium">
                      {statusLabel}
                    </span>
                  )}
                  <span
                    className={cn(
                      'inline-block size-1.5 shrink-0 rounded-full',
                      getStatusDotClasses(mod.health)
                    )}
                    title={statusLabel}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
