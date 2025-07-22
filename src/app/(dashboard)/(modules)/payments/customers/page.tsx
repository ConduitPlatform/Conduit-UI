import { CustomersTable } from '@/components/payments/customers/customers-table';

export default function CustomersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer information and payment details.
            </p>
          </div>
        </div>

        <CustomersTable />
      </div>
    </div>
  );
}
