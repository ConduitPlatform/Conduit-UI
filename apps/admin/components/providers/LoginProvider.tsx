'use client';
import React, { ReactNode, startTransition, useEffect, useState } from 'react';
import { getUser } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const LoginProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getUser()
      .then((user) => {
        if (!user) {
          setLoading(false);
          if (pathname !== '/login') {
            router.replace('/login');
          }
        } else {
          if (pathname === '/login') {
            router.replace('/');
          }
          startTransition(() => {
            setLoading(false);
          });
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [pathname, router]);
  return loading ? <Loader2 className='absolute top-[48vh] left-[48vw] h-28 w-28 animate-spin' /> : <>{children}</>;
};
