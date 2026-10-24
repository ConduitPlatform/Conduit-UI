import { ProductsTable } from '@/components/payments/products/products-table';
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui/page-header';

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <div>
          <PageTitle>Products</PageTitle>
          <PageDescription>
            Manage your products and subscription offerings.
          </PageDescription>
        </div>
      </PageHeader>

      <ProductsTable />
    </div>
  );
}
