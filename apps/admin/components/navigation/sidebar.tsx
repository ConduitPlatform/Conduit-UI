import { Cog, User, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/navigation/themeSwitcher';
import * as React from 'react';

export const Sidebar = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 h-[100vh] main-scrollbar min-w-60">
      <div className="sticky top-0 z-10 flex items-center h-16 shrink-0 bg-background">
        <Image
          className="w-auto h-8"
          width={178}
          height={32}
          src="/conduitLogo.svg"
          alt="Conduit Logo"
        />
      </div>
      <nav className="flex flex-col flex-grow h-full gap-y-7">
        <div>
          <div className="flex flex-col">{children}</div>
        </div>
        <div className="flex-grow" />
        <div className="sticky bottom-0 z-10 flex justify-between w-full pt-2 bg-background">
          <div className={'flex gap-1'}>
            <Link
              href={'/settings/general'}
              className={
                'flex rounded-md cursor-pointer px-2 py-1.5 hover:bg-accent hover:text-accent-foreground'
              }
            >
              <Cog className={'w-6 h-6'} />
            </Link>
            <Link
              href={'/settings/user-settings'}
              className={
                'flex rounded-md cursor-pointer px-2 py-1.5 hover:bg-accent hover:text-accent-foreground'
              }
            >
              <User className={'w-6 h-6'} />
            </Link>
            <Link
              href={'/settings/admin-users'}
              className={
                'flex rounded-md cursor-pointer px-2 py-1.5 hover:bg-accent hover:text-accent-foreground'
              }
            >
              <Users />
            </Link>
          </div>
          <div className="mt-auto ">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </div>
  );
};
