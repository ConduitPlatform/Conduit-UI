'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
//@ts-ignore
import { useDebounce } from '@uidotdev/usehooks';

export const SearchInput = ({
  field,
  active = true,
}: {
  field: 'fileName' | 'folderName';
  active?: boolean;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<string>(searchParams.get(field) ?? '');

  const debouncedSearchTerm = useDebounce(value, 300);
  useEffect(() => {
    const params = new URLSearchParams();
    params.set(field, value);
    if (debouncedSearchTerm === '') {
      params.delete(field);
    }
    searchParams.forEach((v, key) => {
      if (key === 'container') {
        params.set(key, v);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setValue(searchParams.get(field) ?? '');
  }, [searchParams]);

  return (
    <Input
      disabled={!active}
      placeholder="Search"
      className={'w-44'}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
};
