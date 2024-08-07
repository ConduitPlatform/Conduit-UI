'use client';
import { Sidebar } from '@/components/navigation/sidebar';
import { SidebarItem } from '@/components/navigation/sidebarItem';
import { SidebarItemWithSub } from '@/components/navigation/sidebarItemWithSub';
import { navList } from '@/app/(dashboard)/navList';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const isSubActive = (href: string) => pathname.includes(href);
  return (
    <div className={'flex'}>
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
      <div className="flex-grow max-h-screen overflow-auto main-scrollbar">
        {children}
      </div>
    </div>
  );
}
