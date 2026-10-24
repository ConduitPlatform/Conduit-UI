import { TransactionsTable } from '@/components/payments/transactions/transactions-table';
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui/page-header';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <div>
          <PageTitle>Transactions</PageTitle>
          <PageDescription>
            View and manage payment transactions.
          </PageDescription>
        </div>
      </PageHeader>

      <TransactionsTable />
    </div>
  );
}
