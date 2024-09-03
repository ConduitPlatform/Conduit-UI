import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';
import { useEffect, useState } from 'react';

export const columns = ({
  formRef,
}: {
  formRef: any;
}): ColumnDef<User, any>[] => {
  const [creatorSelection, setCreatorSelection] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    formRef.setValue('creator', creatorSelection, { shouldValidate: true });
  }, [creatorSelection]);

  return [
    {
      id: 'select',
      enableSorting: false,
      cell: props => (
        <Checkbox
          aria-label="Select row"
          checked={props.row.getIsSelected()}
          onCheckedChange={value => {
            props.row.toggleSelected(!!value);
            if (!value && creatorSelection === props.row.original._id) {
              setCreatorSelection(undefined);
              formRef.setValue('creator', undefined, {
                shouldValidate: true,
              });
            }
          }}
          className={'mx-2.5 border-border-dark-gray shadow-inherit'}
        />
      ),
    },
    {
      accessorKey: '_id',
      header: 'Select Creator',
      enableSorting: false,
      cell: props => (
        <Switch
          disabled={!props.row.getIsSelected()}
          checked={formRef.watch('creator') === props.row.getValue('_id')}
          onCheckedChange={() => {
            setCreatorSelection(props.row.getValue('_id'));
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
