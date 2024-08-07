import { ColumnDef } from '@tanstack/react-table';
import { Admin } from '@/lib/models/User';
import {
  CheckIcon,
  Clipboard,
  KeyRound,
  LucideX,
  Trash,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { ChangePasswordSheet } from '@/components/settings/admin-users/ChangePasswordSheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAlerts } from '@/components/providers/AlertProvider';
import { deleteAdmin } from '@/lib/api/settings/admins';
import { toast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Props {
  loggedUser: string;
}
export default function Columns({ loggedUser }: Props): ColumnDef<Admin>[] {
  const { addAlert } = useAlerts();
  const router = useRouter();

  const handleDelete = (id: string) => {
    addAlert({
      title: 'Delete Admin',
      description: 'Are you sure you want to delete this admin?',
      cancelText: 'Cancel',
      actionText: 'Delete',
      onDecision: cancel => {
        if (!cancel) {
          deleteAdmin(id)
            .then(res => {
              toast({
                title: 'Delete Admin',
                description: (
                  <div className={'flex flex-row items-center space-x-2.5'}>
                    <CheckIcon className={'w-8 h-8'} />
                    <p className="text-sm text-foreground">
                      Admin deleted successfully!
                    </p>
                  </div>
                ),
              });
              router.refresh();
            })
            .catch(err => {
              toast({
                title: 'Add User',
                description: (
                  <div className={'flex flex-col'}>
                    <div
                      className={'flex flex-row text-destructive items-center'}
                    >
                      <LucideX className={'w-8 h-8'} />
                      <p className="text-sm">Failed to add with:</p>
                    </div>
                    <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                      <code className="text-sm text-foreground">
                        {err.message}
                      </code>
                    </pre>
                  </div>
                ),
              });
            });
        }
      },
    });
  };

  return [
    {
      accessorKey: '_id',
      header: 'User ID',
      cell: cell => {
        return (
          <div className={'flex flex-row group'}>
            {cell.getValue() as string}
            <Clipboard
              className={
                'w-4 h-4 ml-2 invisible group-hover:visible cursor-pointer '
              }
              onClick={() => {
                navigator.clipboard.writeText(cell.getValue() as string);
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered At',
      cell: cell => {
        const value = cell.getValue();
        return moment(value as string).format('MM/DD/YYYY');
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return loggedUser !== row.original._id ? (
          <div className={'flex flex-row'}>
            <ChangePasswordSheet id={row.original._id}>
              <Button variant={'ghost'} size={'sm'} title="edit">
                <KeyRound className={'w-4 h-4'} />
              </Button>
            </ChangePasswordSheet>
            <Button
              variant={'ghost'}
              size={'sm'}
              className={'text-destructive'}
              title="delete"
              onClick={() => {
                handleDelete(row.original._id);
              }}
            >
              <Trash className={'w-4 h-4'} />
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={'px-7'}>
                  <UserCheck className={'w-5 h-5 hover:cursor-default'} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current Logged In user</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];
}
