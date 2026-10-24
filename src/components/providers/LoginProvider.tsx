'use client';
import React, { ReactNode, startTransition, useEffect, useState } from 'react';
import { getAdmin } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const LoginProvider = ({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getAdmin()
      .then(user => {
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
        setLoading(false);
        router.replace('/login');
      });
  }, [pathname, router]);
  return loading ? (
    <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Loader2 className="h-28 w-28 animate-spin" />
    </span>
  ) : (
    <>{children}</>
  );
};
