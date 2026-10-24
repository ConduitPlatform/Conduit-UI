'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPaymentSettings } from '@/lib/api/payments';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RedeemCodesTable } from '@/components/payments/redeem-codes/redeem-codes-table';
import { Button } from '@/components/ui/button';
import { PageHeader, PageTitle } from '@/components/ui/page-header';

export default function RedeemCodesPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPaymentSettings();
        setEnabled(!!res.config.redeemCodes);
      } catch {
        setEnabled(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageTitle>Redeem codes</PageTitle>
      </PageHeader>

      {enabled === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : enabled === false ? (
        <Alert>
          <AlertTitle>Feature disabled</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Turn on &quot;Redeem codes&quot; in Payments settings to use this
              API from the admin UI.
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href="/payments/settings">Open settings</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <RedeemCodesTable />
      )}
    </div>
  );
}
