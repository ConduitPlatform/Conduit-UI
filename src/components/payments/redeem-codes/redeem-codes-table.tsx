'use client';

import { useState, useEffect } from 'react';
import type { RedeemCode } from '@/lib/models/payments';
import { deleteRedeemCode, getRedeemCodes } from '@/lib/api/payments';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { entityProductName } from '@/lib/payments/display-helpers';
import { CreateRedeemCodesDialog } from './create-redeem-codes-dialog';

export function RedeemCodesTable() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RedeemCode | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await getRedeemCodes({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
      });
      setCodes(res.redeemCodeDocuments);
      setTotalCount(res.count);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load redeem codes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page, search]);

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await deleteRedeemCode(deleteTarget._id);
      toast({ title: 'Deleted', description: 'Redeem code removed.' });
      setShowDelete(false);
      setDeleteTarget(null);
      fetchCodes();
    } catch {
      toast({
        title: 'Error',
        description: 'Could not delete code.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Redeem codes</span>
            <Button type="button" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create codes
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search codes..."
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
                  <TableHead>Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Valid until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No redeem codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map(row => (
                    <TableRow key={row._id}>
                      <TableCell className="font-mono text-sm">
                        {row.code}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entityProductName(row.product)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.validUntil
                          ? new Date(row.validUntil).toLocaleString()
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString()
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
                              className="text-destructive"
                              onClick={() => {
                                setDeleteTarget(row);
                                setShowDelete(true);
                              }}
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
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRedeemCodesDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={fetchCodes}
      />

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete redeem code?</DialogTitle>
            <DialogDescription>
              This removes the code{' '}
              <span className="font-mono">{deleteTarget?.code}</span>. It cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
