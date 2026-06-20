'use client';

import { useState, useEffect } from 'react';
import { PaymentsConfig } from '@/lib/models/payments';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/api/payments';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PaymentsSettingsForm } from './payments-settings-form';
import { useSettingsSave } from '@/lib/hooks/use-settings-save';

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
  const { save, isSaving } = useSettingsSave('Payments');
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getPaymentSettings();
      setConfig(response.config);
    } catch {
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
    const updatedSettings = {
      ...config,
      active: !config.active,
    };

    void save({
      action: () => updatePaymentSettings(updatedSettings),
      onSuccess: () => {
        setConfig(updatedSettings);
        router.refresh();
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await save({
      action: () => updatePaymentSettings(config),
      onSuccess: () => router.refresh(),
    });
    if (result.ok) {
      setEdit(false);
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
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
            <Switch
              checked={config.active}
              disabled={isSaving}
              onCheckedChange={handleModuleToggle}
            />
          </div>
          <div className={'pr-2 w-7/12'}>
            <p className={'text-xs text-muted-foreground'}>
              Configure payment providers and general settings for the payments
              module. You can enable multiple payment providers simultaneously.
            </p>
          </div>
        </div>

        {config.active && (
          <form onSubmit={handleSubmit}>
            <PaymentsSettingsForm
              edit={edit}
              isSaving={isSaving}
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
