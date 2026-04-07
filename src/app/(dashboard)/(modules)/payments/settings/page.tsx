import { PaymentsSettings } from '@/components/payments/settings/payments-settings';
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from '@/components/ui/page-header';

export default function PaymentsSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <div>
          <PageTitle>Payment Settings</PageTitle>
          <PageDescription>
            Configure your payment providers and settings.
          </PageDescription>
        </div>
      </PageHeader>

      <PaymentsSettings />
    </div>
  );
}
