import { Cog } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/navigation/themeSwitcher';

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
          <Link
            href='/settings'
            className='flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-foreground hover:bg-secondary'
          >
            <Cog className={'w-6 h-6'} />
            <span className='sr-only'>Settings</span>
            <span aria-hidden='true'>Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
