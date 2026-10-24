import { TicketPlus, PlusIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default function EmptyInvites({
  onCreate,
}: Readonly<{ onCreate: () => void }>) {
  return (
    <EmptyState
      icon={TicketPlus}
      title="No invite tokens"
      description="Create a persistent invite token to let users auto-join this team on registration."
      action={
        <Button onClick={onCreate}>
          <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
          New Invite
        </Button>
      }
    />
  );
}
