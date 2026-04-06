'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/models/payments';
import { createRedeemCodes, getProducts } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';

function parseCodes(raw: string): string[] {
  const parts = raw.split(/[\n,]+/);
  return [...new Set(parts.map(c => c.trim()).filter(Boolean))];
}

interface CreateRedeemCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRedeemCodesDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRedeemCodesDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [codesText, setCodesText] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await getProducts({ skip: 0, limit: 500 });
        setProducts(res.productDocuments);
        if (res.productDocuments.length && !productId) {
          setProductId(res.productDocuments[0]._id!);
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Could not load products.',
          variant: 'destructive',
        });
      }
    })();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codes = parseCodes(codesText);
    if (!productId || codes.length === 0) {
      toast({
        title: 'Missing data',
        description: 'Select a product and enter at least one code.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await createRedeemCodes({
        productId,
        codes,
        validUntil: validUntil.trim()
          ? new Date(validUntil).toISOString()
          : undefined,
      });
      toast({
        title: 'Created',
        description: `${codes.length} code(s) created.`,
      });
      setCodesText('');
      setValidUntil('');
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create redeem codes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create redeem codes</DialogTitle>
          <DialogDescription>
            Bulk-create codes for a product. Requires redeem codes to be enabled
            in Payments settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products found. Create a product first.
              </p>
            ) : (
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id!}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="codes">Codes</Label>
            <Textarea
              id="codes"
              value={codesText}
              onChange={e => setCodesText(e.target.value)}
              placeholder="One per line or comma-separated"
              rows={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid until (optional)</Label>
            <Input
              id="validUntil"
              type="datetime-local"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || products.length === 0}>
              {loading ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
