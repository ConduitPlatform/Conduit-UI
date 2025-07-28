'use client';

import { useState } from 'react';
import { Product, RecurringEnum, ValidityEnum } from '@/lib/models/payments';
import { createProduct } from '@/lib/api/payments';
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

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    value: 0, // This will be stored in cents
    vat: 0,
    currency: 'USD',
    isSubscription: false,
    recurring: RecurringEnum.month,
    recurringCount: 1,
    stripe: {
      priceId: '',
    },
    // New virtual currency fields
    creditType: '',
    creditAmount: 0,
    validityAmount: 0,
    validityUnit: 'days',
    rollover: false,
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProduct({
        ...formData,
        value: convertDollarsToCents(formData.value as number),
      } as Product);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      onSuccess();
      setFormData({
        name: '',
        value: 0, // This will be stored in cents
        vat: 0,
        currency: 'USD',
        isSubscription: false,
        recurring: RecurringEnum.month,
        recurringCount: 1,
        stripe: {
          priceId: '',
        },
        // New virtual currency fields
        creditType: '',
        creditAmount: 0,
        validityAmount: 0,
        validityUnit: 'days',
        rollover: false,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create product',
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
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Create a new product or subscription offering.
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
              <Label htmlFor="value">Price</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={e =>
                  handleChange('value', parseFloat(e.target.value) || 0)
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
                    <SelectItem value={RecurringEnum.day}>Days</SelectItem>
                    <SelectItem value={RecurringEnum.week}>Weeks</SelectItem>
                    <SelectItem value={RecurringEnum.month}>Months</SelectItem>
                    <SelectItem value={RecurringEnum.year}>Years</SelectItem>
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

          {/* Virtual Currency Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasVirtualCurrency"
                checked={!!formData.creditType}
                onCheckedChange={checked => {
                  if (!checked) {
                    handleChange('creditType', '');
                    handleChange('creditAmount', 0);
                    handleChange('validityAmount', 0);
                    handleChange('validityUnit', 'day');
                    handleChange('rollover', false);
                  } else {
                    handleChange('creditType', 'credits');
                    handleChange('creditAmount', 0);
                    handleChange('validityAmount', 0);
                    handleChange('validityUnit', 'day');
                    handleChange('rollover', false);
                  }
                }}
              />
              <Label htmlFor="hasVirtualCurrency">
                Virtual Currency Product
              </Label>
            </div>

            {formData.creditType && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditType">Credit Type</Label>
                    <Input
                      id="creditType"
                      value={formData.creditType}
                      onChange={e => handleChange('creditType', e.target.value)}
                      placeholder="e.g., minutes, tokens, credits"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creditAmount">Credit Amount</Label>
                    <Input
                      id="creditAmount"
                      type="number"
                      min="0"
                      value={formData.creditAmount}
                      onChange={e =>
                        handleChange(
                          'creditAmount',
                          parseInt(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validityAmount">
                      Validity Period Amount
                    </Label>
                    <Input
                      id="validityAmount"
                      type="number"
                      min="0"
                      value={formData.validityAmount}
                      onChange={e =>
                        handleChange(
                          'validityAmount',
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0 for no expiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validityUnit">Validity Unit</Label>
                    <Select
                      value={formData.validityUnit}
                      onValueChange={value =>
                        handleChange('validityUnit', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ValidityEnum.day}>Days</SelectItem>
                        <SelectItem value={ValidityEnum.week}>Weeks</SelectItem>
                        <SelectItem value={ValidityEnum.month}>
                          Months
                        </SelectItem>
                        <SelectItem value={ValidityEnum.year}>Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="rollover"
                    checked={formData.rollover}
                    onCheckedChange={checked =>
                      handleChange('rollover', checked)
                    }
                  />
                  <Label htmlFor="rollover">Credits Roll Over on Renewal</Label>
                </div>
              </div>
            )}
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
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
