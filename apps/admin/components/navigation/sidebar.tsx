import { Cog, User, Users2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/navigation/themeSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as React from 'react';

export const Sidebar = ({ children }: { children?: ReactNode }) => {
  return (
    <div className='flex flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 h-[100vh]'>
      <div className='flex h-16 shrink-0 items-center'>
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
        <div className=' mt-auto'>
          <ThemeSwitcher/>
        </div>
        <div className='-mx-6'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className='flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-foreground hover:bg-secondary'>
                  <span className='sr-only'>Settings</span>
                  <span aria-hidden='true'>Settings</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'start'}>
                <DropdownMenuItem>
                  <Link href={'/settings/general'} className={'flex gap-2 items-center'}>
                    <Cog className={'w-6 h-6'} />
                    General
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem >
                  <Link href={'/settings/user-settings'} className={'flex gap-2 items-center'}>
                    <User className={'w-6 h-6'} />
                    User Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem >
                  <Link href={'/settings/admin-users'} className={'flex gap-2 items-center'}>
                    <Users2 />
                    Admin Users
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </nav>
    </div>
  );
};
