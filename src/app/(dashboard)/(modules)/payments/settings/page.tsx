import { PaymentsSettings } from '@/components/payments/settings/payments-settings';

export default function PaymentsSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your payment providers and settings.
          </p>
        </div>
      </div>

      <PaymentsSettings />
    </div>
  );
}
