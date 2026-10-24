'use client';

import { ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { useCallback, useEffect, useState } from 'react';
import { switchEnv } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getEnvName, getEnvNames } from '@/lib/logic/EnvManager';
import { cn } from '@/lib/utils';

export function EnvIndicator() {
  const [env, setEnv] = useState<string>();
  const [availableEnvs, setAvailableEnvs] = useState<string[]>();
  const router = useRouter();

  useEffect(() => {
    getEnvNames().then(setAvailableEnvs);
    getEnvName().then(setEnv);
  }, []);

  const handleSwitchEnv = useCallback(
    async (newEnv: string) => {
      await switchEnv(newEnv);
      setEnv(newEnv);
      router.replace('/');
    },
    [router]
  );

  if (!env) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 text-xs text-muted-foreground',
            'hover:text-foreground transition-colors duration-100 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 -mx-1'
          )}
        >
          <Globe className="size-3" />
          {env}
          <ChevronDown className="size-2.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-44 rounded-lg bg-surface-1 border-border"
        align="end"
        sideOffset={6}
      >
        <DropdownMenuLabel className="text-[13px] font-medium text-muted-foreground px-2 py-1.5">
          Switch Environment
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="h-px bg-border" />
        {availableEnvs?.map(availableEnv => (
          <DropdownMenuItem
            key={availableEnv}
            className="gap-2 text-[13px] cursor-pointer"
            onClick={() => handleSwitchEnv(availableEnv)}
            disabled={availableEnv === env}
          >
            <Globe className="size-3.5" />
            {availableEnv}
            {env === availableEnv && (
              <span className="text-xs text-muted-foreground ml-auto">
                current
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
