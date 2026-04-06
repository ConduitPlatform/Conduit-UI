'use client';

import { useState, useEffect } from 'react';
import { Customer, CustomerBalance, Transaction } from '@/lib/models/payments';
import { getCustomerBalances, getTransactions } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { EditBalanceDialog } from '@/components/payments/balances/edit-balance-dialog';
import { DeleteBalanceDialog } from '@/components/payments/balances/delete-balance-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { formatCentsToCurrency } from '@/lib/utils';
import {
  formatTransactionProducts,
  transactionDisplayCurrency,
} from '@/lib/payments/display-helpers';
import { TransactionsTable } from '@/components/payments/transactions/transactions-table';

interface CustomerDetailsProps {
  customer: Customer;
  onClose?: () => void;
}

export function CustomerDetails({ customer, onClose }: CustomerDetailsProps) {
  const [balances, setBalances] = useState<CustomerBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editBalance, setEditBalance] = useState<CustomerBalance | null>(null);
  const [showEditBalance, setShowEditBalance] = useState(false);
  const [balanceToDelete, setBalanceToDelete] =
    useState<CustomerBalance | null>(null);
  const [showDeleteBalance, setShowDeleteBalance] = useState(false);

  const { toast } = useToast();

  const fetchBalances = async () => {
    if (!customer.user) return;

    try {
      setLoadingBalances(true);
      const userId =
        typeof customer.user === 'string' ? customer.user : customer.user._id;
      const response = await getCustomerBalances(userId);
      setBalances(response.balances);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customer balances',
        variant: 'destructive',
      });
    } finally {
      setLoadingBalances(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await getTransactions({
        skip: 0,
        limit: 50,
        customerId: customer._id!,
      });
      setTransactions(response.transactionDocuments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customer transactions',
        variant: 'destructive',
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'balances') {
      fetchBalances();
    }
  }, [activeTab, customer._id]);

  useEffect(() => {
    setActiveTab('overview');
  }, [customer._id]);

  useEffect(() => {
    if (!customer._id) return;
    void fetchTransactions();
    void fetchBalances();
  }, [customer._id]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset all state when component unmounts
      setBalances([]);
      setTransactions([]);
      setLoadingBalances(false);
      setLoadingTransactions(false);
      setActiveTab('overview');
    };
  }, []);

  const getExpiryStatus = (expiry?: string) => {
    if (!expiry) return { status: 'never' as const, color: 'default' as const };

    const expiryDate = new Date(expiry);
    const now = new Date();

    if (expiryDate < now) {
      return { status: 'expired' as const, color: 'destructive' as const };
    } else if (expiryDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return { status: 'expiring-soon' as const, color: 'secondary' as const };
    }
    return { status: 'active' as const, color: 'default' as const };
  };

  const totalBalanceByType = balances.reduce(
    (acc, balance) => {
      acc[balance.creditType] = (acc[balance.creditType] || 0) + balance.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Details</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm">
                      {customer.firstName} {customer.lastname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm">{customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-sm">
                      {customer.phoneNumber || customer.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-sm">{customer.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Post Code
                    </label>
                    <p className="text-sm">{customer.postCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Stripe ID
                    </label>
                    <p className="text-sm font-mono text-xs">
                      {customer.stripe?.customerId || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBalances ? (
                  <div className="text-center py-4">Loading balances...</div>
                ) : balances.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No balances found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(totalBalanceByType).map(
                      ([creditType, total]) => (
                        <div
                          key={creditType}
                          className="flex items-center justify-between"
                        >
                          <Badge variant="outline">{creditType}</Badge>
                          <span className="font-mono font-medium">{total}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No recent transactions
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(transaction => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {formatTransactionProducts(transaction)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.status} •{' '}
                          {transaction.createdAt
                            ? new Date(
                                transaction.createdAt
                              ).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCentsToCurrency(
                            transaction.priceWithVat ?? 0,
                            transactionDisplayCurrency(transaction)
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {transaction.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credit Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rollover</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBalances ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : balances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No balances found
                        </TableCell>
                      </TableRow>
                    ) : (
                      balances.map(balance => {
                        const expiryStatus = getExpiryStatus(balance.expiry);
                        return (
                          <TableRow key={balance._id}>
                            <TableCell className="font-medium">
                              <Badge variant="outline">
                                {balance.creditType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono">
                                {balance.amount}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {balance.source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {balance.expiry ? (
                                <span className="text-sm">
                                  {new Date(
                                    balance.expiry
                                  ).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Never
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={expiryStatus.color}>
                                {expiryStatus.status === 'never' && 'Active'}
                                {expiryStatus.status === 'active' && 'Active'}
                                {expiryStatus.status === 'expiring-soon' &&
                                  'Expiring Soon'}
                                {expiryStatus.status === 'expired' && 'Expired'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  balance.rollover ? 'default' : 'secondary'
                                }
                              >
                                {balance.rollover ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {balance.createdAt
                                ? new Date(
                                    balance.createdAt
                                  ).toLocaleDateString()
                                : '-'}
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
                                    onClick={() => {
                                      setEditBalance(balance);
                                      setShowEditBalance(true);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit amount
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setBalanceToDelete(balance);
                                      setShowDeleteBalance(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction history</CardTitle>
            </CardHeader>
            <CardContent>
              {customer._id ? (
                <TransactionsTable
                  customerId={customer._id}
                  embedded
                  title={undefined}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Customer settings and management options will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditBalanceDialog
        open={showEditBalance}
        onOpenChange={setShowEditBalance}
        balance={editBalance}
        onSuccess={fetchBalances}
      />

      <DeleteBalanceDialog
        open={showDeleteBalance}
        onOpenChange={setShowDeleteBalance}
        balance={balanceToDelete}
        onSuccess={fetchBalances}
      />
    </div>
  );
}
