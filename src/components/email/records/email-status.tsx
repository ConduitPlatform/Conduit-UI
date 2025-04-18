'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fetchEmailStatus } from '@/lib/api/email';

interface EmailStatusProps {
  emailId: string;
}

export function EmailStatus({ emailId }: Readonly<EmailStatusProps>) {
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const statusData = await fetchEmailStatus(emailId);
      setStatus(statusData.statusInfo);
    } catch (error) {
      console.error('Failed to fetch email status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [emailId]);

  const getStatusBadge = () => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status.status) {
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusBadge()}
      <Button
        variant="ghost"
        size="icon"
        onClick={fetchStatus}
        disabled={loading}
        className="h-8 w-8"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
