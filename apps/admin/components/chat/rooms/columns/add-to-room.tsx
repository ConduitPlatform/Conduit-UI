import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/models/User';

export const columns = (): ColumnDef<User, any>[] => {
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
          }}
          className={'mx-2.5 border-border-dark-gray shadow-inherit'}
        />
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ];
};
