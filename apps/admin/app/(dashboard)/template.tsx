'use client';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getRouterSettings } from '@/lib/api/router';
import ScalarIcon from '@/icons';

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
  const [graphql, setGraphql] = useState<boolean>(false);
  const pathname = usePathname();
  const whichModule = pathname.split('/')[1];
  const moduleName = MODULE_NAMES[pathname.split('/')[1]];
  useEffect(() => {
    getRouterSettings().then((res) => {
      setGraphql(res.config.transports.graphql);
    });
  }, []);

  if (!moduleName) return (<>{children}</>);
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
            <ScalarIcon className={'mr-2 w-3 h-3'} />
            Scalar
          </Button>
          {graphql &&
            <Button variant='outline'>
              <Image src={'/graphql.svg'} alt={'graphql'} width={16} height={16} className={'mr-2'} />
              GraphQL
            </Button>
          }
          <Link href={`https://getconduit.dev/docs/modules/${whichModule}`} target={'_blank'}>
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
