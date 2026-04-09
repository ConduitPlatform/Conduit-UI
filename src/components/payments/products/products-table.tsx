'use client';

import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { Product } from '@/lib/models/payments';
import {
  deleteProduct,
  getProducts,
  retireProduct,
  unretireProduct,
} from '@/lib/api/payments';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  MoreHorizontal,
  Search,
  Trash2,
  Edit,
  Copy,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { formatCentsToCurrency, cn } from '@/lib/utils';
import { AddProductDialog } from './add-product-dialog';
import { EditProductDialog } from './edit-product-dialog';

function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message && typeof data.message === 'string') return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

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
  const [showRetireDialog, setShowRetireDialog] = useState(false);
  const [showUnretireDialog, setShowUnretireDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToRetire, setProductToRetire] = useState<Product | null>(null);
  const [productToUnretire, setProductToUnretire] = useState<Product | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
      });
      setProducts(response.productDocuments);
      setTotalCount(response.count);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const copyProductId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast({
        title: 'Copied',
        description: 'Product ID copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!productToDelete?._id) return;
    setActionLoading(true);
    try {
      await deleteProduct(productToDelete._id);
      toast({ title: 'Product deleted' });
      setShowDeleteDialog(false);
      setProductToDelete(null);
      await fetchProducts();
    } catch (error) {
      toast({
        title: 'Could not delete',
        description: apiErrorMessage(error, 'Delete failed'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetire = async () => {
    if (!productToRetire?._id) return;
    setActionLoading(true);
    try {
      await retireProduct(productToRetire._id);
      toast({ title: 'Product retired' });
      setShowRetireDialog(false);
      setProductToRetire(null);
      await fetchProducts();
    } catch (error) {
      toast({
        title: 'Could not retire',
        description: apiErrorMessage(error, 'Retire failed'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnretire = async () => {
    if (!productToUnretire?._id) return;
    setActionLoading(true);
    try {
      await unretireProduct(productToUnretire._id);
      toast({ title: 'Product active again' });
      setShowUnretireDialog(false);
      setProductToUnretire(null);
      await fetchProducts();
    } catch (error) {
      toast({
        title: 'Could not unretire',
        description: apiErrorMessage(error, 'Unretire failed'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleRetireClick = (product: Product) => {
    setProductToRetire(product);
    setShowRetireDialog(true);
  };

  const handleUnretireClick = (product: Product) => {
    setProductToUnretire(product);
    setShowUnretireDialog(true);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const colSpan = 13;

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
                  <TableHead className="min-w-[140px]">Product ID</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell colSpan={colSpan} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="text-center">
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
                        {product._id ? (
                          <div className="flex items-center gap-1 group max-w-[200px]">
                            <span
                              className="font-mono text-xs tabular-nums truncate"
                              title={product._id}
                            >
                              {product._id}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100"
                              title="Copy product ID"
                              onClick={() => copyProductId(product._id!)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {product.retiredAt ? (
                          <Badge variant="secondary">Retired</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
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
                            {product.retiredAt ? (
                              <DropdownMenuItem
                                onClick={() => handleUnretireClick(product)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Unretire
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleRetireClick(product)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Retire
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(product)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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

      <Dialog open={showRetireDialog} onOpenChange={setShowRetireDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Retire product</DialogTitle>
            <DialogDescription>
              Retiring stops new purchases, new subscription sign-ups, and
              redeem-code use for this product. Existing subscriptions can still
              renew; RevenueCat webhooks still resolve this product ID.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="warning">
            <AlertTitle>Redeem codes</AlertTitle>
            <AlertDescription>
              Outstanding redeem codes for this product will fail until you
              unretire or delete those codes in Redeem codes.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Stores and RevenueCat</AlertTitle>
            <AlertDescription>
              Remove or hide the SKU from App Store Connect, Google Play, and
              RevenueCat offerings separately—Conduit does not sync those
              dashboards automatically.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRetireDialog(false);
                setProductToRetire(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRetire}
              disabled={actionLoading}
              className={cn('bg-amber-600 hover:bg-amber-600/90 text-white')}
            >
              Retire product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnretireDialog} onOpenChange={setShowUnretireDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unretire product</DialogTitle>
            <DialogDescription>
              This product will be available for new purchases and redeem-code
              creation again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnretireDialog(false);
                setProductToUnretire(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUnretire} disabled={actionLoading}>
              Unretire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              Permanently remove this product record. Only allowed when no
              subscriptions and no redeem codes reference it.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Risk</AlertTitle>
            <AlertDescription>
              App Store, Play, and RevenueCat map purchases to this Conduit
              product ID. Deleting breaks webhook mapping and history for that
              ID. Prefer retiring unless you are sure this product was never
              shipped.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
