import { Cog, User, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/navigation/themeSwitcher';
import * as React from 'react';


export const Sidebar = ({ children }: { children?: ReactNode }) => {
  return (
    <div className='flex flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 h-[100vh] main-scrollbar'>
      <div className='flex h-16 shrink-0 items-center sticky top-0 bg-background z-10'>
        <Image
          className='h-8 w-auto'
          width={178}
          height={32}
          src='/conduitLogo.svg'
          alt='Conduit Logo'
        />
      </div>
      <nav className='flex flex-grow flex-col gap-y-7 h-full'>
        <div>
          <div className='flex flex-col'>
            {children}
          </div>
        </div>
        <div className='flex-grow' />
        <div className=' flex justify-between sticky bg-background bottom-0 z-10 w-full pt-2'>
          <div className={'flex gap-1'}>
                <Link href={'/settings/general'} className={'flex rounded-md cursor-default px-2 py-1.5 hover:bg-accent hover:text-accent-foreground'}>
                  <Cog className={'w-6 h-6'} />
                </Link>
              <Link href={'/settings/user-settings'} className={'flex rounded-md cursor-default px-2 py-1.5 hover:bg-accent hover:text-accent-foreground'}>
                <User className={'w-6 h-6'} />
              </Link>
              <Link href={'/settings/admin-users'} className={'flex rounded-md cursor-default px-2 py-1.5 hover:bg-accent hover:text-accent-foreground'}>
                <Users />
              </Link>
          </div>
          <div className=' mt-auto'>
            <ThemeSwitcher/>
          </div>
        </div>
      </nav>
    </div>
  );
};
