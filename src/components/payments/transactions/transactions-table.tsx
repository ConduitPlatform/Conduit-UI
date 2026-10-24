'use client';

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/models/payments';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MoreHorizontal, Search, Eye, Pencil, Ban } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { formatCentsToCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  formatTransactionProducts,
  transactionDisplayCurrency,
} from '@/lib/payments/display-helpers';
import { EditTransactionDialog } from './edit-transaction-dialog';
import { CancelTransactionDialog } from './cancel-transaction-dialog';

function statusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'success':
      return 'default';
    case 'prepared':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'cancelled':
    case 'canceled':
      return 'outline';
    default:
      return 'secondary';
  }
}

export interface TransactionsTableProps {
  /** When set, list is scoped to this customer (admin API). */
  customerId?: string;
  /** Optional title for embedded tables (e.g. customer drawer). */
  title?: string;
  /** Omit outer Card wrapper (e.g. inside another Card). */
  embedded?: boolean;
}

export function TransactionsTable({
  customerId,
  title,
  embedded,
}: TransactionsTableProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Transaction | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
        customerId,
      });
      setTransactions(response.transactionDocuments);
      setTotalCount(response.count);
    } catch {
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
  }, [page, search, customerId]);

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewDialog(true);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const colCount = 8;

  const tableBlock = (
    <>
      {!customerId && (
        <div className="mb-4 flex items-center space-x-2">
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
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total (incl. VAT)</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colCount} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(transaction => {
                const currency = transactionDisplayCurrency(transaction);
                return (
                  <TableRow key={transaction._id}>
                    <TableCell className="max-w-[120px] truncate font-mono text-xs">
                      {typeof transaction.customer === 'string'
                        ? transaction.customer
                        : transaction.customer?._id || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.provider}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {formatTransactionProducts(transaction)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(transaction.status ?? '')}>
                        {transaction.status ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-variant-numeric tabular-nums text-sm">
                      {formatCentsToCurrency(
                        transaction.priceWithVat ?? 0,
                        currency
                      )}
                    </TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            type="button"
                          >
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
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditTarget(transaction);
                              setShowEditDialog(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCancelTarget(transaction);
                              setShowCancelDialog(true);
                            }}
                            disabled={
                              transaction.status !== 'prepared' &&
                              transaction.status !== 'success'
                            }
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{' '}
            {Math.min(page * limit, totalCount)} of {totalCount} transactions
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
    </>
  );

  return (
    <div className="space-y-4">
      {embedded ? (
        <div className="space-y-4">
          {title ? (
            <h3 className="text-lg font-semibold leading-none">{title}</h3>
          ) : null}
          {tableBlock}
        </div>
      ) : (
        <Card>
          <CardHeader>
            {title ? (
              <h3 className="text-lg font-semibold leading-none">{title}</h3>
            ) : null}
          </CardHeader>
          <CardContent>{tableBlock}</CardContent>
        </Card>
      )}

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
            <DialogDescription>
              Full transaction record from the payments module.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <p className="font-mono text-sm text-muted-foreground">
                    {selectedTransaction._id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={statusVariant(selectedTransaction.status ?? '')}
                    >
                      {selectedTransaction.status ?? '—'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm text-muted-foreground">
                    {typeof selectedTransaction.customer === 'string'
                      ? selectedTransaction.customer
                      : selectedTransaction.customer?._id || '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.provider}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Products</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatTransactionProducts(selectedTransaction)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCentsToCurrency(
                      selectedTransaction.price,
                      transactionDisplayCurrency(selectedTransaction)
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price with VAT</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCentsToCurrency(
                      selectedTransaction.priceWithVat ?? 0,
                      transactionDisplayCurrency(selectedTransaction)
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">VAT %</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.vatPercentage ?? '—'}%
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
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.updatedAt
                      ? new Date(selectedTransaction.updatedAt).toLocaleString()
                      : '—'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Transaction data</Label>
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-4 text-xs">
                  {JSON.stringify(selectedTransaction.data, null, 2)}
                </pre>
              </div>
              {selectedTransaction.providerResponse?.length ? (
                <div>
                  <Label className="text-sm font-medium">
                    Provider response
                  </Label>
                  <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-4 text-xs">
                    {JSON.stringify(
                      selectedTransaction.providerResponse,
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : null}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        transaction={editTarget}
        onSuccess={fetchTransactions}
      />

      <CancelTransactionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        transaction={cancelTarget}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
