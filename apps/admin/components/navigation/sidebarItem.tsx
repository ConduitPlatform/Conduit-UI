import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const SidebarItem = ({ children, href, active = false }: {
  children: ReactNode,
  href: string,
  active?: boolean
}) => {
  return (
    <Link
      href={href}
      className={cn(
        active ? 'bg-secondary' : 'hover:bg-secondary',
        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-foreground items-center',
      )}
    >
      {children}
    </Link>

  );

};
