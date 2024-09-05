'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';
import { Switch } from '@/components/ui/switch';
import { useWatch } from 'react-hook-form';

export const columns = ({
  formRef,
}: {
  formRef: any;
}): ColumnDef<User, any>[] => {
  const creator = useWatch({
    control: formRef.control,
    name: 'creator',
  });

  return [
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
  ];
};
