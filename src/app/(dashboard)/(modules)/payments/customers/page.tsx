import { CustomersTable } from '@/components/payments/customers/customers-table';
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui/page-header';

export default function CustomersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <PageHeader>
          <div>
            <PageTitle>Customers</PageTitle>
            <PageDescription>
              Manage your customer information and payment details.
            </PageDescription>
          </div>
        </PageHeader>

        <CustomersTable />
      </div>
    </div>
  );
}
