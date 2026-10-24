'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NavItem } from './navList.config';
import type { HealthStatus } from '@/lib/status';

interface SidebarNavItemProps {
  item: NavItem;
  serving?: boolean;
  healthStatus?: HealthStatus;
}

export function SidebarNavItem({
  item,
  serving,
  healthStatus,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  const isActive =
    item.url === '/'
      ? pathname === '/'
      : pathname === item.url || pathname.startsWith(item.url + '/');

  const hasSubPages = item.items && item.items.length > 0;

  const iconButton = (
    <Link
      href={item.url}
      data-active={isActive}
      className={cn(
        'relative flex w-9 h-8 items-center justify-center rounded-[6px]',
        'text-sidebar-foreground/50 transition-colors duration-100',
        'hover:bg-sidebar-accent hover:text-sidebar-foreground/80',
        'data-[active=true]:bg-primary-muted data-[active=true]:text-primary-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-0'
      )}
    >
      <Icon className="size-[18px]" />
      {isActive && (
        <span
          className="absolute -left-[7px] top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
      {serving !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 size-[5px] rounded-full',
            !serving
              ? 'bg-status-warning shadow-[0_0_4px_var(--color-status-warning)]'
              : healthStatus === 'critical'
                ? 'bg-status-critical shadow-[0_0_4px_var(--color-status-critical)]'
                : healthStatus === 'warning'
                  ? 'bg-status-warning shadow-[0_0_4px_var(--color-status-warning)]'
                  : 'bg-status-healthy shadow-[0_0_4px_var(--color-status-healthy)]'
          )}
          aria-hidden="true"
        />
      )}
    </Link>
  );

  if (!hasSubPages) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{iconButton}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <HoverCard openDelay={80} closeDelay={200}>
      <HoverCardTrigger asChild>{iconButton}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        sideOffset={8}
        align="start"
        className="w-48 p-0 rounded-lg border border-border bg-surface-1 shadow-2"
      >
        <Link
          href={item.url}
          className={cn(
            'block px-3 py-2 text-[13px] font-medium text-foreground',
            'hover:bg-sidebar-accent rounded-t-lg transition-colors duration-100'
          )}
        >
          {item.title}
        </Link>
        <div className="h-px bg-border" />
        <div className="py-1">
          {item.items!.map(sub => {
            const isSubActive =
              pathname.startsWith(sub.url) &&
              sub.url !== '/' &&
              sub.url.length ===
                Math.max(
                  ...item.items!.map(s =>
                    pathname.startsWith(s.url) ? s.url.length : 0
                  )
                );

            return (
              <Link
                key={sub.url}
                href={sub.url}
                className={cn(
                  'block mx-1 px-2 py-1.5 text-[13px] rounded-md transition-colors duration-100',
                  isSubActive
                    ? 'text-primary-muted-foreground bg-primary-muted'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                {sub.title}
              </Link>
            );
          })}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
