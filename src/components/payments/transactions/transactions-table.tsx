'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/models/payments';
import { getTransactions } from '@/lib/api/payments';
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
import { MoreHorizontal, Search, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { formatCentsToCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
      });
      setTransactions(response.transactionDocuments);
      setTotalCount(response.count);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search]);

  // Note: Delete functionality not available in API
  const handleDelete = async () => {
    toast({
      title: 'Not Available',
      description: 'Delete functionality is not available in the current API',
      variant: 'destructive',
    });
    setShowDeleteDialog(false);
    setTransactionToDelete(null);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteDialog(true);
  };

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewDialog(true);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
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
                  <TableHead>User ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map(transaction => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium">
                        {typeof transaction.customer === 'string'
                          ? transaction.customer
                          : transaction.customer?._id || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.provider}</Badge>
                      </TableCell>
                      <TableCell>{transaction.product}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>
                        {transaction.createdAt
                          ? new Date(transaction.createdAt).toLocaleDateString()
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
                              onClick={() => handleView(transaction)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {/* Delete functionality not available in API */}
                            {/* <DropdownMenuItem
                              onClick={() => handleDeleteClick(transaction)}
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
                {Math.min(page * limit, totalCount)} of {totalCount}{' '}
                transactions
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
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

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm text-muted-foreground">
                    {typeof selectedTransaction.customer === 'string'
                      ? selectedTransaction.customer
                      : selectedTransaction.customer?._id || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.provider}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.product}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCentsToCurrency(selectedTransaction.price)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price with VAT</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCentsToCurrency(selectedTransaction.priceWithVat)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">VAT Percentage</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.vatPercentage}%
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quantity</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.quantity}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.createdAt
                      ? new Date(selectedTransaction.createdAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.updatedAt
                      ? new Date(selectedTransaction.updatedAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Transaction Data</Label>
                <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedTransaction.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
