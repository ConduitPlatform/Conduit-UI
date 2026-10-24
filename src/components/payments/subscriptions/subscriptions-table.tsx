'use client';

import { useState, useEffect } from 'react';
import type { Subscription, SubscriptionStatus } from '@/lib/models/payments';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MoreHorizontal, Search, Eye, Pencil, Ban } from 'lucide-react';
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
import {
  entityProductName,
  subscriptionCustomerLabel,
  subscriptionUserId,
} from '@/lib/payments/display-helpers';
import { EditSubscriptionDialog } from './edit-subscription-dialog';
import { CancelSubscriptionDialog } from './cancel-subscription-dialog';

function resolvedStatus(s: Subscription): string {
  if (s.status) return s.status;
  return new Date(s.activeUntil) > new Date() ? 'active' : 'expired';
}

function statusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status as SubscriptionStatus) {
    case 'active':
      return 'default';
    case 'canceled':
      return 'secondary';
    case 'expired':
      return 'outline';
    case 'overdue':
      return 'destructive';
    default:
      return 'secondary';
  }
}

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
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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
    } catch {
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

  const openEdit = (subscription: Subscription) => {
    setEditTarget(subscription);
    setShowEditDialog(true);
  };

  const openCancel = (subscription: Subscription) => {
    setCancelTarget(subscription);
    setShowCancelDialog(true);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const colCount = 10;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader />
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
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
                  <TableHead>User</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Next payment</TableHead>
                  <TableHead>Active until</TableHead>
                  <TableHead>Tx</TableHead>
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
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colCount} className="text-center">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map(subscription => {
                    const status = resolvedStatus(subscription);
                    return (
                      <TableRow key={subscription._id}>
                        <TableCell className="max-w-[120px] truncate font-mono text-xs">
                          {subscriptionUserId(subscription)}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-sm">
                          {subscriptionCustomerLabel(subscription)}
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate font-medium">
                          {entityProductName(subscription.product)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subscription.provider}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(status)}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.isTrial ? (
                            <Badge variant="secondary">Trial</Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {subscription.nextPayment
                            ? new Date(
                                subscription.nextPayment
                              ).toLocaleString()
                            : '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {subscription.activeUntil
                            ? new Date(
                                subscription.activeUntil
                              ).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subscription.transactions?.length ?? 0}
                          </Badge>
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
                                onClick={() => handleView(subscription)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(subscription)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openCancel(subscription)}
                                disabled={
                                  status === 'canceled' || status === 'expired'
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription details</DialogTitle>
            <DialogDescription>
              Full subscription record from the payments module.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Subscription ID</Label>
                  <p className="font-mono text-sm text-muted-foreground">
                    {selectedSubscription._id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="font-mono text-sm text-muted-foreground">
                    {subscriptionUserId(selectedSubscription)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionCustomerLabel(selectedSubscription)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm text-muted-foreground">
                    {entityProductName(selectedSubscription.product)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.provider}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Managed by</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.managedBy ?? '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={statusBadgeVariant(
                        resolvedStatus(selectedSubscription)
                      )}
                    >
                      {resolvedStatus(selectedSubscription)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trial</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.isTrial ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Active until</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.activeUntil
                      ? new Date(
                          selectedSubscription.activeUntil
                        ).toLocaleString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">First payment</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.firstPayment
                      ? new Date(
                          selectedSubscription.firstPayment
                        ).toLocaleString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Next payment</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.nextPayment
                      ? new Date(
                          selectedSubscription.nextPayment
                        ).toLocaleString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last payment</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.lastPayment
                      ? new Date(
                          selectedSubscription.lastPayment
                        ).toLocaleString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Seat count</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.options?.seatCount ?? '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">VAT exempt</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.options?.vatExempt ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Upgrading to</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.upgradingTo
                      ? entityProductName(selectedSubscription.upgradingTo)
                      : '—'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">
                    Provider metadata
                  </Label>
                  <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                    {selectedSubscription.providerMetadata != null
                      ? JSON.stringify(
                          selectedSubscription.providerMetadata,
                          null,
                          2
                        )
                      : '—'}
                  </pre>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.createdAt
                      ? new Date(
                          selectedSubscription.createdAt
                        ).toLocaleString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.updatedAt
                      ? new Date(
                          selectedSubscription.updatedAt
                        ).toLocaleString()
                      : '—'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Transactions ({selectedSubscription.transactions?.length ?? 0}
                  )
                </Label>
                {selectedSubscription.transactions &&
                selectedSubscription.transactions.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedSubscription.transactions.map(
                      (transaction, index) => (
                        <div key={index} className="rounded-md bg-muted p-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Provider:</span>{' '}
                              {transaction.provider}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>{' '}
                              {transaction.status}
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
                                : '—'}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No transactions in this list response.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditSubscriptionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        subscription={editTarget}
        onSuccess={fetchSubscriptions}
      />

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        subscription={cancelTarget}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
}
