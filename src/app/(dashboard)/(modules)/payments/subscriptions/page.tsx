import { SubscriptionsTable } from '@/components/payments/subscriptions/subscriptions-table';
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui/page-header';

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <div>
          <PageTitle>Subscriptions</PageTitle>
          <PageDescription>
            View and manage active subscriptions.
          </PageDescription>
        </div>
      </PageHeader>

      <SubscriptionsTable />
    </div>
  );
}
