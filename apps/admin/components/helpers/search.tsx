'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
//@ts-ignore
import { useDebounce } from '@uidotdev/usehooks';

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<string>(searchParams.get('search') ?? '');

  const debouncedSearchTerm = useDebounce(value, 300);
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('search', value);
    if (debouncedSearchTerm === '') {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  return (
    <Input
      placeholder="Search"
      className={'w-44'}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
};
