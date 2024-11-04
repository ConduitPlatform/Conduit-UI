'use client';
import React from 'react';
import { Sidebar } from './sidebar';
import { navList } from '@/app/(dashboard)/navList';
import { SidebarItemWithSub } from './sidebarItemWithSub';
import { usePathname } from 'next/navigation';
import { SidebarItem } from './sidebarItem';

export default function SidebarList() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const isSubActive = (href: string) => pathname.includes(href);

  return (
    <Sidebar>
      {navList.map(item => {
        if (item.children) {
          return (
            <SidebarItemWithSub
              key={item.href}
              active={isActive(item.href) || isSubActive(item.href)}
            >
              <SidebarItem href={item.href} key={item.href}>
                {item.icon}
                {item.name}
              </SidebarItem>
              {item.children.map(child => (
                <SidebarItem
                  href={child.href}
                  active={
                    isActive(child.href) ||
                    (child.href !== item.href && isSubActive(child.href))
                  }
                  key={child.href}
                >
                  {child.icon}
                  {child.name}
                </SidebarItem>
              ))}
            </SidebarItemWithSub>
          );
        }
        return (
          <SidebarItem
            href={item.href}
            active={isActive(item.href)}
            key={item.href}
          >
            {item.icon}
            {item.name}
          </SidebarItem>
        );
      })}
    </Sidebar>
  );
}
