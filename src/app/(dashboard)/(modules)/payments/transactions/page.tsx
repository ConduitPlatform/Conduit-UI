import { TransactionsTable } from '@/components/payments/transactions/transactions-table';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage payment transactions.
          </p>
        </div>
      </div>

      <TransactionsTable />
    </div>
  );
}
