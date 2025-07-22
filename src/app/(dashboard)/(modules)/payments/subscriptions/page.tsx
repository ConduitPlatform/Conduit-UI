import { SubscriptionsTable } from '@/components/payments/subscriptions/subscriptions-table';

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            View and manage active subscriptions.
          </p>
        </div>
      </div>

      <SubscriptionsTable />
    </div>
  );
}
