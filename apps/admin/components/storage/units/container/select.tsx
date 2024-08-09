'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/lib/models/storage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCallback } from 'react';

// TODO: integrate create container
export const SelectContainerDialog = ({
  containers,
}: {
  containers: Container[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>{searchParams.get('container') ?? 'Select Container'}</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Container</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            onValueChange={value =>
              router.push(
                pathname + '?' + createQueryString('container', value)
              )
            }
            value={searchParams.get('container') ?? ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent className={'bg-white dark:bg-popover'}>
              {containers.map(container => (
                <SelectItem value={container.name}>{container.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
};
