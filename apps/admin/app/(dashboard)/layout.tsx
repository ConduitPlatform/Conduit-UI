import { Sidebar } from '@/components/navigation/sidebar';
import { SidebarItem } from '@/components/navigation/sidebarItem';
import { SidebarItemWithSub } from '@/components/navigation/sidebarItemWithSub';
import { navList } from '@/app/(dashboard)/navList';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={'flex'}>
      <Sidebar>
        {navList.map((item) => {
          if (item.children) {
            return (
              <SidebarItemWithSub key={item.href}>
                <SidebarItem href={item.href} active={false}>
                  {item.icon}
                  {item.name}
                </SidebarItem>
                {item.children.map((child) => (
                  <SidebarItem href={child.href} active={false} key={child.href}>
                    {child.icon}
                    {child.name}
                  </SidebarItem>
                ))}
              </SidebarItemWithSub>
            );
          }
          return (
            <SidebarItem href={item.href} active={false} key={item.href}>
              {item.icon}
              {item.name}
            </SidebarItem>
          );
        })}
      </Sidebar>
      <div className='flex-grow max-h-screen overflow-auto main-scrollbar'>{children}</div>
    </div>);

};
