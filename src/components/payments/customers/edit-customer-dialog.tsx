'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/lib/models/payments';
import { updateCustomer } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { useUserPicker } from '@/components/helpers/UserPicker/UserPicker';
import { User } from '@/lib/models/User';

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onSuccess: () => void;
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Customer>(customer);

  const { toast } = useToast();
  const { openPicker } = useUserPicker();

  useEffect(() => {
    setFormData(customer);
  }, [customer]);

  const handleUserPicker = () => {
    openPicker(
      (users: User[]) => {
        if (users.length > 0) {
          const user = users[0];
          setSelectedUser(user);
          setFormData(prev => ({
            ...prev,
            user: user._id!,
            email: user.email || prev.email,
          }));
        }
      },
      {
        multiple: false,
        title: 'Select User',
        description: 'Choose a user for this customer',
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateCustomer(customer._id!, formData);
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update customer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Customer, value: string) => {
    if (field === 'stripe') {
      setFormData(prev => ({
        ...prev,
        stripe: { customerId: value },
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
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information and payment details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>User</Label>
            <div className="flex gap-2">
              <Input
                value={
                  selectedUser
                    ? `${selectedUser.email} (${selectedUser._id})`
                    : typeof formData.user === 'string'
                      ? formData.user
                      : formData.user?._id || 'No user selected'
                }
                placeholder="Select a user"
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUserPicker}
              >
                Select User
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={e => handleChange('lastname', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postCode">Post Code</Label>
              <Input
                id="postCode"
                value={formData.postCode}
                onChange={e => handleChange('postCode', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripeId">Stripe Customer ID</Label>
              <Input
                id="stripeId"
                value={formData.stripe?.customerId}
                onChange={e => handleChange('stripe', e.target.value)}
                required
              />
            </div>
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
              {loading ? 'Updating...' : 'Update Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
