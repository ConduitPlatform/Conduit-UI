'use client';

import { useState } from 'react';
import { Product, RecurringEnum, ValidityEnum } from '@/lib/models/payments';
import { createProduct } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyCombobox } from '@/components/payments/currency-combobox';
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
import { convertDollarsToCents, parseMoneyInputString } from '@/lib/utils';

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
  const [priceInput, setPriceInput] = useState('');
  const [vatInput, setVatInput] = useState('0');
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    productDescription: '',
    value: 0,
    vat: 0,
    currency: 'USD',
    isSubscription: false,
    trialDays: 0,
    supportsMultipleSeats: false,
    recurring: RecurringEnum.month,
    recurringCount: 1,
    recurringDate: 0,
    maxOverdueDays: 1,
    stripe: {
      priceId: '',
      subscriptionId: '',
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

    const priceMajor = parseMoneyInputString(priceInput);
    const vatParsed = parseMoneyInputString(vatInput);
    if (priceMajor === null || priceMajor < 0) {
      toast({
        title: 'Invalid price',
        description: 'Enter a valid amount (e.g. 9.99 or 9,99).',
        variant: 'destructive',
      });
      return;
    }
    if (vatParsed === null || vatParsed < 0) {
      toast({
        title: 'Invalid VAT',
        description: 'Enter a valid percentage (e.g. 21 or 21,5).',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await createProduct({
        ...formData,
        value: convertDollarsToCents(priceMajor),
        vat: vatParsed,
      } as Product);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      onSuccess();
      setPriceInput('');
      setVatInput('0');
      setFormData({
        name: '',
        productDescription: '',
        value: 0,
        vat: 0,
        currency: 'USD',
        isSubscription: false,
        trialDays: 0,
        supportsMultipleSeats: false,
        recurring: RecurringEnum.month,
        recurringCount: 1,
        recurringDate: 0,
        maxOverdueDays: 1,
        stripe: {
          priceId: '',
          subscriptionId: '',
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
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const setStripeField = (key: 'priceId' | 'subscriptionId', value: string) => {
    setFormData(prev => ({
      ...prev,
      stripe: {
        ...prev.stripe,
        priceId: prev.stripe?.priceId ?? '',
        subscriptionId: prev.stripe?.subscriptionId ?? '',
        [key]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label htmlFor="productDescription">Description (optional)</Label>
            <Textarea
              id="productDescription"
              value={formData.productDescription ?? ''}
              onChange={e => handleChange('productDescription', e.target.value)}
              placeholder="Shown to admins and in integrations"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Price (major units)</Label>
              <Input
                id="value"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                placeholder="e.g. 9.99 or 9,99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT (%)</Label>
              <Input
                id="vat"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={vatInput}
                onChange={e => setVatInput(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <CurrencyCombobox
                id="currency"
                value={formData.currency ?? 'USD'}
                onValueChange={value => handleChange('currency', value)}
              />
              <p className="text-xs text-muted-foreground">
                ISO 4217 code (search by code or name).
              </p>
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
            <>
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
                      <SelectItem value={RecurringEnum.month}>
                        Months
                      </SelectItem>
                      <SelectItem value={RecurringEnum.year}>Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trialDays">Trial period (days)</Label>
                <Input
                  id="trialDays"
                  type="number"
                  min="0"
                  value={formData.trialDays ?? 0}
                  onChange={e =>
                    handleChange('trialDays', parseInt(e.target.value) || 0)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of free trial days before first charge (0 = no trial).
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="supportsMultipleSeats"
                  checked={!!formData.supportsMultipleSeats}
                  onCheckedChange={checked =>
                    handleChange('supportsMultipleSeats', checked)
                  }
                />
                <Label htmlFor="supportsMultipleSeats">
                  Supports multiple seats
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurringDate">Renewal day of month</Label>
                <Input
                  id="recurringDate"
                  type="number"
                  min="0"
                  max="28"
                  value={formData.recurringDate ?? 0}
                  onChange={e =>
                    handleChange(
                      'recurringDate',
                      Math.min(28, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  0 = same day as billing start; otherwise day 1–28.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxOverdueDays">Max overdue (grace days)</Label>
                <Input
                  id="maxOverdueDays"
                  type="number"
                  min="0"
                  value={formData.maxOverdueDays ?? 1}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    handleChange(
                      'maxOverdueDays',
                      Number.isNaN(n) ? 1 : Math.max(0, n)
                    );
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Extra days after renewal before marking overdue.
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stripePriceId">Stripe Price ID (optional)</Label>
              <Input
                id="stripePriceId"
                value={formData.stripe?.priceId ?? ''}
                onChange={e => setStripeField('priceId', e.target.value)}
                placeholder="price_..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripeSubscriptionId">
                Stripe product ID (optional)
              </Label>
              <Input
                id="stripeSubscriptionId"
                value={formData.stripe?.subscriptionId ?? ''}
                onChange={e => setStripeField('subscriptionId', e.target.value)}
                placeholder="prod_..."
              />
              <p className="text-xs text-muted-foreground">
                Backend stores Stripe product id here for subscription products.
              </p>
            </div>
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
              <div className="space-y-4 border-l-2 border-border-strong pl-4">
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
