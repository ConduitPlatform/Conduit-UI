'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export const SearchInput = ({
  field,
}: {
  field: 'fileName' | 'folderName';
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <Input
      placeholder="Search"
      className={'w-44'}
      value={searchParams.get(field) ?? undefined}
      onChange={e =>
        router.push(pathname + '?' + createQueryString(field, e.target.value))
      }
    />
  );
};
