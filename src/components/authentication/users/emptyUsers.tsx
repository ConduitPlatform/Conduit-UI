import { UserPlus, PlusIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default function EmptyUsers({
  userAdd,
}: Readonly<{ userAdd: () => void }>) {
  return (
    <EmptyState
      icon={UserPlus}
      title="No users"
      description="Get started by creating a new one."
      action={
        <Button onClick={userAdd}>
          <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
          New User
        </Button>
      }
    />
  );
}
