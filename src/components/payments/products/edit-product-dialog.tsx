'use client';

import { useState, useEffect } from 'react';
import { Product, RecurringEnum } from '@/lib/models/payments';
import { updateProduct } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { convertDollarsToCents } from '@/lib/utils';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onSuccess: () => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Product>(product);

  const { toast } = useToast();

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProduct(product._id!, formData);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Product, value: any) => {
    if (field === 'stripe') {
      setFormData(prev => ({
        ...prev,
        stripe: { priceId: value },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information and pricing details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                Price (in dollars, will be stored as cents)
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value ? (formData.value / 100).toFixed(2) : ''}
                onChange={e =>
                  handleChange(
                    'value',
                    convertDollarsToCents(parseFloat(e.target.value) || 0)
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT (%)</Label>
              <Input
                id="vat"
                type="number"
                step="0.01"
                min="0"
                value={formData.vat}
                onChange={e =>
                  handleChange('vat', parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={value => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isSubscription"
              checked={formData.isSubscription}
              onCheckedChange={checked =>
                handleChange('isSubscription', checked)
              }
            />
            <Label htmlFor="isSubscription">Subscription Product</Label>
          </div>

          {formData.isSubscription && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurringCount">Recurring Count</Label>
                <Input
                  id="recurringCount"
                  type="number"
                  min="1"
                  value={formData.recurringCount}
                  onChange={e =>
                    handleChange(
                      'recurringCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurring">Recurring Period</Label>
                <Select
                  value={formData.recurring}
                  onValueChange={value =>
                    handleChange('recurring', value as RecurringEnum)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecurringEnum.day}>Day</SelectItem>
                    <SelectItem value={RecurringEnum.week}>Week</SelectItem>
                    <SelectItem value={RecurringEnum.month}>Month</SelectItem>
                    <SelectItem value={RecurringEnum.year}>Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="stripeId">Stripe Price ID (Optional)</Label>
            <Input
              id="stripeId"
              value={formData.stripe?.priceId}
              onChange={e => handleChange('stripe', e.target.value)}
              placeholder="price_..."
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
