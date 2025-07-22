'use client';

import { useState, useEffect } from 'react';
import { PaymentsConfig } from '@/lib/models/payments';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CheckIcon, LoaderIcon, LucideX } from 'lucide-react';
import { PaymentsSettingsForm } from './payments-settings-form';

export function PaymentsSettings() {
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [config, setConfig] = useState<PaymentsConfig>({
    active: false,
    stripe: {
      enabled: false,
      secret_key: '',
    },
  });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getPaymentSettings();
      setConfig(response.config);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payment settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = () => {
    const { id, dismiss } = toast({
      title: 'Payments',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">
            Updating Payments Settings...
          </p>
        </div>
      ),
    });

    const updatedSettings = {
      ...config,
      active: !config.active,
    };

    updatePaymentSettings(updatedSettings)
      .then(res => {
        dismiss();
        toast({
          title: 'Payments',
          description: (
            <div className={'flex flex-row items-center space-x-2.5'}>
              <CheckIcon className={'w-8 h-8'} />
              <p className="text-sm text-foreground">
                Payments Settings Updated!
              </p>
            </div>
          ),
        });
        router.refresh();
      })
      .catch(err => {
        dismiss();
        toast({
          title: 'Payments',
          description: (
            <div className={'flex flex-col'}>
              <div className={'flex flex-row text-destructive items-center'}>
                <LucideX className={'w-8 h-8'} />
                <p className="text-sm">Failed to update with:</p>
              </div>
              <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
                <code className="text-sm text-foreground">{err.message}</code>
              </pre>
            </div>
          ),
        });
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEdit(false);

    const { id, dismiss } = toast({
      title: 'Payments',
      description: (
        <div className={'flex flex-row items-center space-x-2.5'}>
          <LoaderIcon className={'w-8 h-8 animate-spin'} />
          <p className="text-sm text-foreground">
            Updating Payments Settings...
          </p>
        </div>
      ),
    });

    try {
      await updatePaymentSettings(config);
      dismiss();
      toast({
        title: 'Payments',
        description: (
          <div className={'flex flex-row items-center space-x-2.5'}>
            <CheckIcon className={'w-8 h-8'} />
            <p className="text-sm text-foreground">
              Payments Settings Updated!
            </p>
          </div>
        ),
      });
      router.refresh();
    } catch (error: any) {
      dismiss();
      toast({
        title: 'Payments',
        description: (
          <div className={'flex flex-col'}>
            <div className={'flex flex-row text-destructive items-center'}>
              <LucideX className={'w-8 h-8'} />
              <p className="text-sm">Failed to update with:</p>
            </div>
            <pre className="mt-2 w-[340px] rounded-md bg-secondary p-4 text-destructive">
              <code className="text-sm text-foreground">{error.message}</code>
            </pre>
          </div>
        ),
      });
    }
  };

  const handleConfigChange = (field: keyof PaymentsConfig, value: any) => {
    if (field === 'stripe') {
      setConfig(prev => ({
        ...prev,
        stripe: { ...prev.stripe, ...value },
      }));
    } else if (field === 'viva') {
      setConfig(prev => ({
        ...prev,
        viva: { ...prev.viva, ...value },
      }));
    } else if (field === 'piraeus') {
      setConfig(prev => ({
        ...prev,
        piraeus: { ...prev.piraeus, ...value },
      }));
    } else if (field === 'revenueCat') {
      setConfig(prev => ({
        ...prev,
        revenueCat: { ...prev.revenueCat, ...value },
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={'container mx-auto py-10 main-scrollbar'}>
      <div className={'flex flex-col gap-6'}>
        <div className="space-y-0.5">
          <div className={'flex gap-2 items-center'}>
            <p className="text-2xl font-medium">Payments Module</p>
            <Switch
              checked={config.active}
              onCheckedChange={handleModuleToggle}
            />
          </div>
          <div className={'pr-2 w-7/12'}>
            <p className={'text-xs text-[#94A3B8]'}>
              Configure payment providers and general settings for the payments
              module. You can enable multiple payment providers simultaneously.
            </p>
          </div>
        </div>

        {config.active && (
          <form onSubmit={handleSubmit}>
            <PaymentsSettingsForm
              edit={edit}
              setEdit={setEdit}
              config={config}
              onConfigChange={handleConfigChange}
            />
          </form>
        )}
      </div>
    </div>
  );
}
