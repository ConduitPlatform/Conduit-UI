import { UserPlus, PlusIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default function EmptyTeamMembers({
  memberAdd,
}: Readonly<{ memberAdd: () => void }>) {
  return (
    <EmptyState
      icon={UserPlus}
      title="No members"
      description="Get started by adding one."
      action={
        <Button onClick={memberAdd}>
          <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
          New Member
        </Button>
      }
    />
  );
}
