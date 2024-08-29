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

export const SelectContainerDialog = ({
  containers,
  callback,
}: {
  containers: Container[];
  callback: () => void;
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
    <div className="py-4">
      <Select
        onValueChange={value => {
          callback();
          router.push(pathname + '?' + createQueryString('container', value));
        }}
        value={searchParams.get('container') ?? undefined}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select container" />
        </SelectTrigger>
        <SelectContent className={'bg-white dark:bg-popover'}>
          {containers.map(container => (
            <SelectItem key={container._id} value={container.name}>
              {container.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
