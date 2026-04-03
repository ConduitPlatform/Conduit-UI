'use client';

import { useState, useEffect } from 'react';
import { CustomerBalance } from '@/lib/models/payments';
import { getCustomerBalances } from '@/lib/api/payments';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Plus } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { GrantBalanceDialog } from '@/components/payments/balances/grant-balance-dialog';

export default function CustomerBalancesPage() {
  const [balances, setBalances] = useState<CustomerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [creditType, setCreditType] = useState('');
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [showGrantDialog, setShowGrantDialog] = useState(false);

  const { toast } = useToast();

  const fetchBalances = async () => {
    if (!userId) {
      setBalances([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getCustomerBalances(
        userId,
        creditType || undefined
      );
      setBalances(response.balances);
      setTotalCount(response.count);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customer balances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [userId, creditType]);

  const filteredBalances = balances.filter(
    balance =>
      balance.creditType.toLowerCase().includes(search.toLowerCase()) ||
      balance.source.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Balances</h1>
        <Button onClick={() => setShowGrantDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Grant Balance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer User ID</label>
              <Input
                placeholder="Enter user ID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Credit Type (Optional)
              </label>
              <Input
                placeholder="e.g., minutes, tokens"
                value={creditType}
                onChange={e => setCreditType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search balances..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Balances ({filteredBalances.length} of {totalCount})
          </CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {userId
                        ? 'No balances found'
                        : 'Enter a user ID to view balances'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBalances.map(balance => {
                    const expiryStatus = getExpiryStatus(balance.expiry);
                    return (
                      <TableRow key={balance._id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{balance.creditType}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{balance.amount}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {balance.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {balance.expiry ? (
                            <span className="text-sm">
                              {new Date(balance.expiry).toLocaleDateString()}
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
                            variant={balance.rollover ? 'default' : 'secondary'}
                          >
                            {balance.rollover ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {balance.createdAt
                            ? new Date(balance.createdAt).toLocaleDateString()
                            : '-'}
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

      <GrantBalanceDialog
        open={showGrantDialog}
        onOpenChange={setShowGrantDialog}
        onSuccess={() => {
          if (userId) {
            fetchBalances();
          }
          setShowGrantDialog(false);
        }}
      />
    </div>
  );
}
