import { ProductsTable } from '@/components/payments/products/products-table';

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your products and subscription offerings.
          </p>
        </div>
      </div>

      <ProductsTable />
    </div>
  );
}
