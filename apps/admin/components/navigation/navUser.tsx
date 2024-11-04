'use client';

import { ChevronsUpDown, LogOut, User, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getAdmin } from '@/lib/api';
import { Admin } from '@/lib/models/User';

export function NavUser() {
  const { isMobile } = useSidebar();
  const [user, setUser] = useState<Admin>();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    getAdmin().then(user => {
      setUser(user);
    });
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center flex-1 gap-2 text-sm leading-tight text-left">
                <span className="flex items-center justify-center w-8 h-8 uppercase border rounded-full bg-muted border-border">
                  {user?.username.slice(0, 1)}
                </span>
                <div>
                  <span className="font-semibold truncate">
                    {user?.username}
                  </span>
                  <span className="text-xs truncate">{user?.email}</span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md bg-background"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex items-center flex-1 gap-2 text-sm leading-tight text-left">
                  <span className="flex items-center justify-center w-8 h-8 uppercase border rounded-full bg-muted border-border">
                    {user?.username.slice(0, 1)}
                  </span>
                  <div>
                    <span className="font-semibold truncate">
                      {user?.username}
                    </span>
                    <span className="text-xs truncate">{user?.email}</span>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="h-[1px] bg-accent my-1.5" />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Sun className="w-4 h-4" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background">
                    <DropdownMenuCheckboxItem
                      checked={theme === 'light'}
                      onCheckedChange={() => setTheme('light')}
                    >
                      Light
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={theme === 'dark'}
                      onCheckedChange={() => setTheme('dark')}
                    >
                      Dark
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={theme === 'system'}
                      onCheckedChange={() => setTheme('system')}
                    >
                      System
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuItem className="gap-2">
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
