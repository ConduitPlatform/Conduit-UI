'use client';

import { Badge } from '@/components/ui/badge';

interface EmailStatusProps {
  emailId: string;
}

export function EmailStatus(_props: Readonly<EmailStatusProps>) {
  return (
    <Badge
      variant="outline"
      title="Delivery status is not available via the admin API"
    >
      Unavailable
    </Badge>
  );
}
