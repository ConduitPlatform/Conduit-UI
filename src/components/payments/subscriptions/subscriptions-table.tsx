'use client';

import { useState, useEffect } from 'react';
import { Subscription } from '@/lib/models/payments';
import { getSubscriptions } from '@/lib/api/payments';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Search, Eye } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptions({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
      });
      setSubscriptions(response.subscriptionDocuments);
      setTotalCount(response.count);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, search]);

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewDialog(true);
  };

  const isActive = (subscription: Subscription) => {
    return new Date(subscription.activeUntil) > new Date();
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
                placeholder="Search subscriptions..."
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
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Until</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map(subscription => (
                    <TableRow key={subscription._id}>
                      <TableCell className="font-medium">
                        {subscription.userId}
                      </TableCell>
                      <TableCell>{subscription.customerId}</TableCell>
                      <TableCell>{subscription.product}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscription.provider}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isActive(subscription) ? 'default' : 'secondary'
                          }
                        >
                          {isActive(subscription) ? 'Active' : 'Expired'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.activeUntil
                          ? new Date(
                              subscription.activeUntil
                            ).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.transactions?.length || 0}
                        </Badge>
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
                              onClick={() => handleView(subscription)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
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
                {Math.min(page * limit, totalCount)} of {totalCount}{' '}
                subscriptions
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

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Detailed information about this subscription.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.userId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer ID</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.customerId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.product}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.provider}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      isActive(selectedSubscription) ? 'default' : 'secondary'
                    }
                  >
                    {isActive(selectedSubscription) ? 'Active' : 'Expired'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Active Until</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.activeUntil
                      ? new Date(
                          selectedSubscription.activeUntil
                        ).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.createdAt
                      ? new Date(
                          selectedSubscription.createdAt
                        ).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.updatedAt
                      ? new Date(
                          selectedSubscription.updatedAt
                        ).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>
              {selectedSubscription.iamport && (
                <div>
                  <Label className="text-sm font-medium">
                    Iamport Next Payment ID
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.iamport.nextPaymentId}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">
                  Transactions ({selectedSubscription.transactions?.length || 0}
                  )
                </Label>
                {selectedSubscription.transactions &&
                selectedSubscription.transactions.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedSubscription.transactions.map(
                      (transaction, index) => (
                        <div key={index} className="p-3 bg-muted rounded-md">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Provider:</span>{' '}
                              {transaction.provider}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span>{' '}
                              {transaction.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>{' '}
                              {transaction.createdAt
                                ? new Date(
                                    transaction.createdAt
                                  ).toLocaleDateString()
                                : '-'}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No transactions found
                  </p>
                )}
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
