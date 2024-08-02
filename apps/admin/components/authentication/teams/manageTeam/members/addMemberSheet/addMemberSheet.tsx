import { ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/hooks/use-toast';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { createUser } from '@/lib/api/authentication';
import { TeamUser } from '@/lib/models/User';
import { useAlerts } from '@/components/providers/AlertProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const AddMemberSheet = ({ children, defaultOpen, onClose, onSuccess }: {
  children?: ReactNode,
  onSuccess?: (user: TeamUser) => void,
  onClose?: () => void,
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen !== undefined ? defaultOpen : false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { addAlert } = useAlerts();
  useEffect(() => {
    if (defaultOpen !== undefined) setOpen(defaultOpen);
  }, [defaultOpen]);
  useEffect(() => {
    if (!open && selectedMembers.length === 0) {
      onClose?.();
    }
    if (!open && selectedMembers.length > 0) {
      addAlert({
        title: 'Add Member',
        description: 'Are you sure you want to close this sheet? Any unsaved changes will be lost.',
        cancelText: 'Cancel',
        actionText: 'Close',
        onDecision: (cancel) => {
          if (!cancel) {
            onClose?.();
            setSelectedMembers([]);
          }
          setOpen(true);
        },
      });
    } else if (!open) {
      onClose?.();
    }
  }, [open]);

  function onSubmit() {
    const { id, dismiss } = toast({
      title: 'Add Member',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className='text-sm text-foreground'>Adding member...</p>
        </div>
      ),
    });
    createUser('data.email', 'data.password')
      .then((user) => {
        setOpen(false);
        dismiss();
        onSuccess?.(user as TeamUser);
        toast({
          title: 'Add Member',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className='text-sm text-foreground'>Member added!</p>
            </div>
          ),
        });
      })
      .catch((error) => {
        dismiss();
        toast({
          title: 'Add Member',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className='text-sm'>Failed to add with:</p>
              </div>
              <pre className='mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive'>
              <code className='text-sm text-foreground'>{error.message}</code>
        </pre>
            </div>

          ),
        });
      });
  }

  return <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Member</DialogTitle>
        <DialogDescription>
          Add a new member to the team. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className='grid gap-4 py-4'>

      </div>
      <DialogFooter>
        <Button type='submit'>Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
};
