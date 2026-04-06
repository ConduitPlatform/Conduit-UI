'use client';

import { useState, useEffect } from 'react';
import { Product, RecurringEnum } from '@/lib/models/payments';
import { getProducts } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MoreHorizontal, Search, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { formatCentsToCurrency } from '@/lib/utils';
import { AddProductDialog } from './add-product-dialog';
import { EditProductDialog } from './edit-product-dialog';

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
      });
      setProducts(response.productDocuments);
      setTotalCount(response.count);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  // Note: Delete functionality not available in API
  const handleDelete = async () => {
    toast({
      title: 'Not Available',
      description: 'Delete functionality is not available in the current API',
      variant: 'destructive',
    });
    setShowDeleteDialog(false);
    setProductToDelete(null);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Virtual Currency</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map(product => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium max-w-[200px]">
                        <span
                          className="line-clamp-2"
                          title={
                            product.productDescription?.trim()
                              ? product.productDescription
                              : undefined
                          }
                        >
                          {product.name}
                        </span>
                        {product.productDescription?.trim() ? (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {product.productDescription}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {formatCentsToCurrency(product.value, product.currency)}
                      </TableCell>
                      <TableCell>{product.vat}%</TableCell>
                      <TableCell>{product.currency}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.isSubscription ? 'default' : 'secondary'
                          }
                        >
                          {product.isSubscription ? 'Subscription' : 'One-time'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.isSubscription &&
                        (product.trialDays ?? 0) > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            {product.trialDays}-day trial
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {product.creditType ? (
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {product.creditType}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {product.creditAmount} credits
                              {product.validityAmount &&
                                product.validityAmount > 0 && (
                                  <span>
                                    {' '}
                                    • {product.validityAmount}{' '}
                                    {product.validityUnit}
                                  </span>
                                )}
                              {product.rollover && <span> • Rollover</span>}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isSubscription
                          ? `${product.recurringCount} ${product.recurring}${product.recurringCount > 1 ? 's' : ''}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {product.stripe?.priceId ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs w-fit max-w-[140px] truncate"
                              title={product.stripe.priceId}
                            >
                              {product.stripe.priceId}
                            </Badge>
                          ) : null}
                          {product.stripe?.subscriptionId ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs w-fit max-w-[140px] truncate"
                              title={product.stripe.subscriptionId}
                            >
                              {product.stripe.subscriptionId}
                            </Badge>
                          ) : null}
                          {!product.stripe?.priceId &&
                          !product.stripe?.subscriptionId
                            ? '-'
                            : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {/* Delete functionality not available in API */}
                            {/* <DropdownMenuItem
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, totalCount)} of {totalCount} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          fetchProducts();
          setShowAddDialog(false);
        }}
      />

      {selectedProduct && (
        <EditProductDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          product={selectedProduct}
          onSuccess={() => {
            fetchProducts();
            setShowEditDialog(false);
            setSelectedProduct(null);
          }}
        />
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
