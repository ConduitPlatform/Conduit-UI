'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useMemo } from 'react';

export function useColumns({
  formRef,
}: {
  formRef: UseFormReturn<any, any, undefined>;
}) {
  const creator = useWatch({
    control: formRef.control,
    name: 'creator',
  });
  return useMemo<ColumnDef<User, any>[]>(
    () => [
      {
        accessorKey: '_id',
        header: 'Select Creator',
        enableSorting: false,
        cell: props => (
          <Switch
            checked={creator && creator === props.row.getValue('_id')}
            onCheckedChange={() => {
              formRef.setValue('creator', props.row.getValue('_id'), {
                shouldValidate: true,
              });
            }}
          />
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
    ],
    []
  );
}
