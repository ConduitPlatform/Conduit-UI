'use client';

import { LogOut, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { adminLogout, getAdmin } from '@/lib/api';
import { Admin } from '@/lib/models/User';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavUser() {
  const [user, setUser] = useState<Admin>();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    getAdmin().then(user => {
      setUser(user);
    });
  }, []);

  const logout = useCallback(async () => {
    await adminLogout();
    router.replace('/login');
  }, [router]);

  const initial = user?.username?.charAt(0) ?? '?';

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'size-7 rounded-full bg-muted border border-sidebar-border',
                'text-[11px] font-medium uppercase text-sidebar-foreground',
                'flex items-center justify-center',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                'transition-colors duration-100 cursor-pointer'
              )}
            >
              {initial}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {user?.username ?? 'Account'}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        className="min-w-52 rounded-lg bg-surface-1 border-border"
        side="right"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <span className="flex items-center justify-center size-7 rounded-full bg-muted border border-border text-[11px] font-medium uppercase">
              {initial}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium truncate">
                {user?.username}
              </span>
              {user?.email && (
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="h-px bg-border" />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 text-[13px]">
              <Sun className="size-3.5" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-surface-1 border-border">
                <DropdownMenuCheckboxItem
                  checked={theme === 'light'}
                  onCheckedChange={() => setTheme('light')}
                  className="text-[13px]"
                >
                  Light
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={theme === 'dark'}
                  onCheckedChange={() => setTheme('dark')}
                  className="text-[13px]"
                >
                  Dark
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={theme === 'system'}
                  onCheckedChange={() => setTheme('system')}
                  className="text-[13px]"
                >
                  System
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuItem className="gap-2 text-[13px]" onClick={logout}>
          <LogOut className="size-3.5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
