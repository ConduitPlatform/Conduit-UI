'use client';

import { ChevronsUpDown, Globe } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { useCallback, useEffect, useState } from 'react';
import { switchEnv } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getEnvName, getEnvNames } from '@/lib/logic/EnvManager';

export function NavEnv() {
  const { isMobile } = useSidebar();
  const [env, setEnv] = useState<string>();
  const [availableEnvs, setAvailableEnvs] = useState<string[]>();
  const router = useRouter();
  useEffect(() => {
    getEnvNames().then(res => {
      setAvailableEnvs(res);
    });
    getEnvName().then(env => {
      setEnv(env);
    });
  }, []);

  const _switchEnv = useCallback(
    async (env: string) => {
      await switchEnv(env);
      setEnv(env);
      router.replace('/');
    },
    [router]
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Globe className="size-4 shrink-0" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{env}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md bg-background"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex items-center flex-1 gap-2 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">
                    Switch Environment
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="h-px bg-accent my-1.5" />
            {availableEnvs?.map(availableEnv => (
              <DropdownMenuItem
                key={availableEnv}
                className="gap-2 hover:cursor-pointer"
                onClick={() => {
                  _switchEnv(availableEnv);
                }}
                disabled={availableEnv === env}
              >
                <Globe className="w-4 h-4" />
                {availableEnv}{' '}
                {env === availableEnv && (
                  <span className="text-xs text-muted-foreground">
                    {' '}
                    (current)
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
