'use client';

import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Decimal from 'decimal.js';

export const Pagination = ({ data, limit }: { data: any; limit: number }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const lastPage = new Decimal(data.filesCount).div(limit).ceil().toNumber();
  const [currentPage, setCurrentPage] = useState<number>(
    new Decimal(Number(searchParams.get('skip')) ?? 0).div(limit).toNumber()
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const previous = (Number(searchParams.get('skip')) ?? 0) - limit;
          setCurrentPage(prevState => --prevState);
          router.push(
            pathname + '?' + createQueryString('skip', previous.toString())
          );
        }}
        disabled={currentPage === 0}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const next = (Number(searchParams.get('skip')) ?? 0) + limit;
          setCurrentPage(prevState => ++prevState);
          router.push(
            pathname + '?' + createQueryString('skip', next.toString())
          );
        }}
        disabled={lastPage === currentPage + 1}
      >
        Next
      </Button>
    </div>
  );
};
