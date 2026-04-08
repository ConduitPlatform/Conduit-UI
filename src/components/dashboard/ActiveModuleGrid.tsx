import { cn } from '@/lib/utils';
import Link from 'next/link';
import { type HealthStatus, getStatusLabel } from '@/lib/status';
import type { Module } from '@/lib/models/Module';
import { COMMUNICATIONS_PROVIDED_MODULES } from '@/lib/utils/module-utils';
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
} from 'lucide-react';

const MODULE_ICONS: Record<string, typeof Users> = {
  authentication: Users,
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

const MODULE_HREFS: Record<string, string> = {
  authentication: '/authentication',
  database: '/database',
  email: '/email',
  storage: '/storage',
  functions: '/functions',
  chat: '/chat',
  sms: '/sms',
  pushNotifications: '/push-notifications',
  payments: '/payments',
  router: '/router',
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  authentication: 'Authentication',
  database: 'Database',
  email: 'Email',
  storage: 'Storage',
  functions: 'Functions',
  chat: 'Chat',
  sms: 'SMS',
  pushNotifications: 'Notifications',
  payments: 'Payments',
  router: 'Router',
};

const DISPLAYABLE_MODULES = new Set(Object.keys(MODULE_DISPLAY_NAMES));

function normalizeModules(raw: Module[]): Module[] {
  const comms = raw.find(m => m.moduleName === 'communications');
  const expanded = [...raw];

  if (comms) {
    for (const sub of COMMUNICATIONS_PROVIDED_MODULES) {
      if (!expanded.some(m => m.moduleName === sub)) {
        expanded.push({
          moduleName: sub,
          url: comms.url,
          serving: comms.serving,
        } as Module);
      }
    }
  }

  return expanded.filter(m => DISPLAYABLE_MODULES.has(m.moduleName));
}

interface ModuleStatusRow {
  name: string;
  status: HealthStatus;
  requests: string;
  iconName: string;
  href: string;
}

interface ActiveModuleGridProps {
  modules: Module[];
  moduleStatuses: ModuleStatusRow[];
}

export function ActiveModuleGrid({
  modules,
  moduleStatuses,
}: Readonly<ActiveModuleGridProps>) {
  const displayable = normalizeModules(modules);
  const servingNames = new Set(
    displayable.filter(m => m.serving).map(m => m.moduleName)
  );

  const statusMap = new Map(moduleStatuses.map(ms => [ms.iconName, ms]));
  const allModules = displayable.map(m => {
    const existing = statusMap.get(m.moduleName);
    return (
      existing ?? {
        name: MODULE_DISPLAY_NAMES[m.moduleName] ?? m.moduleName,
        status: 'unknown' as HealthStatus,
        requests: '',
        iconName: m.moduleName,
        href: MODULE_HREFS[m.moduleName] ?? `/${m.moduleName}`,
      }
    );
  });

  if (allModules.length === 0) {
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
        {allModules.map(mod => {
          const Icon = MODULE_ICONS[mod.iconName] ?? Database;
          const isServing = servingNames.has(mod.iconName);

          return (
            <Link key={mod.iconName} href={mod.href}>
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border border-border bg-surface-1 px-3 py-2.5 transition-colors duration-100',
                  isServing
                    ? 'hover:border-primary/30 hover:bg-[hsl(224_14%_11%)]'
                    : 'opacity-45 cursor-default'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted shrink-0">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[13px] font-medium truncate">
                    {MODULE_DISPLAY_NAMES[mod.iconName] ?? mod.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isServing && mod.requests && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {mod.requests}
                    </span>
                  )}
                  {!isServing && (
                    <span className="text-[11px] text-muted-foreground">
                      Inactive
                    </span>
                  )}
                  <span
                    className={cn(
                      'inline-block size-1.5 shrink-0 rounded-full',
                      isServing ? 'bg-status-healthy' : 'bg-status-unknown'
                    )}
                    title={getStatusLabel(mod.status)}
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
