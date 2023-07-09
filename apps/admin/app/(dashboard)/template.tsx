'use client';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import Image from 'next/image';

const MODULE_NAMES: { [key: string]: string } = {
  'settings': 'Settings',
  'authentication': 'Authentication',
  'authorization': 'Authorization',
  'database': 'Database',
  'storage': 'Storage',
  'chat': 'Chat',
  'forms': 'Forms',
  'email': 'Email',
  'sms': 'SMS',
  'router': 'Router',
  'functions': 'Functions',
  'push-notifications': 'Notifications',
};
export default function ModuleHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const module = pathname.split('/')[1];
  const moduleName = MODULE_NAMES[pathname.split('/')[1]];
  if(!moduleName) return (<>{children}</>);
  return (
    <>
      <div className={'flex flex-row w-full justify-between p-4 border-b items-center'}>
        <h1 className={'font-light text-xl'}>{moduleName}</h1>
        <div className={'flex flex-row space-x-1.5'}>
          <Button variant='outline'>
            <Image src={'/swagger.svg'} alt={'swagger'} width={16} height={16} className={'mr-2'} />
            Swagger
          </Button>
          <Button variant='outline'>
            <Image src={'/graphql.svg'} alt={'graphql'} width={16} height={16} className={'mr-2'} />
            GraphQL
          </Button>
          <Link href={`https://getconduit.dev/docs/modules/${module}`} target={'_blank'}>
            <Button variant='outline'>
              <FileText className='w-4 h-4 mr-2' />
              Documentation
            </Button>
          </Link>
        </div>
      </div>
      {children}
    </>);

};
