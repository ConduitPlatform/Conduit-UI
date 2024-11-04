'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavGroup } from './navGroup';

import Image from 'next/image';
import { NavUser } from './navUser';
import { navList } from './navList.config';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props} className="border-r border-r-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="sticky top-0 z-10 flex items-center h-11 bg-background">
              <Image
                className="w-auto h-8"
                width={178}
                height={32}
                src="/conduitLogo.svg"
                alt="Conduit Logo"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="main-scrollbar ">
        <NavGroup items={navList.navMain} label="Modules" />
        <NavGroup items={navList.navSecondary} className="mt-3" label="Tools" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
