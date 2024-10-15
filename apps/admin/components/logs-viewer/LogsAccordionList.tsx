'use client';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import JsonViewer from './JsonViewer';
import { Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';

type LogsAccordionListProps = {
  className?: string;
};

export function LogsAccordionList({ className }: LogsAccordionListProps) {
  const [value, setValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const iconClass = 'w-4 h-4 flex-shrink-0 text-current';

  const handleCopyToClipboard = async (json: object) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className={cn('w-full overflow-x-auto main-scrollbar p-5', className)}
    >
      {dummyLogs.map((log, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="my-2 transition-opacity duration-200 border rounded-md bg-background border-input"
        >
          <AccordionTrigger
            className={cn(
              'px-3 py-2 hover:no-underline text-medium justify-start',
              value === `item-${index}`
                ? 'border-b border-b-input rounded-t-md bg-secondary'
                : 'rounded-md hover:bg-secondary'
            )}
          >
            <div className="flex items-start w-full gap-3">
              <Badge className="bg-emerald-500">info</Badge>
              {log}
            </div>
          </AccordionTrigger>
          <AccordionContent className="relative pb-0">
            <JsonViewer json={dummyJson} />
            {copied ? (
              <span className="absolute text-sm font-normal top-3 right-6 text-muted-foreground">
                Copied!
              </span>
            ) : (
              <Button
                onClick={() => handleCopyToClipboard(dummyJson)}
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-1 right-3 text-muted-foreground hover:text-primary"
              >
                <Files className={iconClass} />
                <span className="sr-only">Copy log&apos;s metadata</span>
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const dummyLogs = [
  'Oct 04 2024, 02:14:32 pm info GET /config/admin 200 7ms',
  'Oct 04 2024, 02:15:12 pm warning GET /config/admin 401 5ms',
  'Oct 04 2024, 02:16:05 pm error GET /config/admin 500 8ms',
  'Oct 04 2024, 02:17:22 pm info GET /config/admin 200 6ms',
  'Oct 04 2024, 02:18:45 pm warning GET /config/admin 403 9ms',
  'Oct 04 2024, 02:19:37 pm error GET /config/admin 500 4ms',
  'Oct 04 2024, 02:20:14 pm info GET /config/admin 200 10ms',
  'Oct 04 2024, 02:21:08 pm warning GET /config/admin 404 6ms',
  'Oct 04 2024, 02:22:55 pm info GET /config/admin 200 7ms',
  'Oct 04 2024, 02:23:41 pm warning GET /config/admin 401 5ms',
  'Oct 04 2024, 02:24:27 pm error GET /config/admin 500 8ms',
  'Oct 04 2024, 02:25:13 pm info GET /config/admin 200 7ms',
  'Oct 04 2024, 02:26:32 pm warning GET /config/admin 403 6ms',
  'Oct 04 2024, 02:27:44 pm error GET /config/admin 500 9ms',
  'Oct 04 2024, 02:28:15 pm info GET /config/admin 200 5ms',
  'Oct 04 2024, 02:29:15 pm info GET /config/admin 200 5ms',
  'Oct 04 2024, 02:30:00 pm info GET /config/admin 200 3ms',
  'Oct 04 2024, 02:29:15 pm info GET /config/admin 200 5ms',
  'Oct 04 2024, 02:32:00 pm error GET /config/admin 401 3ms',
];

const dummyJson = {
  meta: {
    req: {
      url: '/api/user/profile',
      headers: {
        masterkey: 'DUMMYMASTERKEY',
        cookie:
          '_ga=GA1.1.123456789.1234567890; _gcl_au=1.1.987654321.1234567890; _ga_ABC12345=GS1.1.1234567890.1.1.1234567891.27.0.0; Bearer=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZmE3NDNjMzU4ZDI5ZGE4NzBiYzgxMyIsImlhdCI6MTcyODYzMzU3NywiZXhwIjoxNzI4NzA1NTc3fQ.DUMMYTOKEN',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'https://example.dev.domain.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        accept: '*/*',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua':
          "'Chromium';v='111', 'Not A;Brand';v='99', 'Google Chrome';v='111'",
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZmE3NDNjMzU4ZDI5ZGE4NzBiYzgxMyIsImlhdCI6MTcyODYzMzU3NywiZXhwIjoxNzI4NzA1NTc3fQ.DUMMYTOKEN',
        'sec-ch-ua-platform': "'Windows'",
        'x-scheme': 'https',
        'x-forwarded-scheme': 'https',
        'x-forwarded-proto': 'https',
        'x-forwarded-port': '443',
        'x-forwarded-host': 'example.dev.domain.com',
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.1',
        'x-request-id': 'abc1234567890defghijklmnop',
        host: 'example-core.service.cluster.local:80',
        connection: 'keep-alive',
      },
      method: 'GET',
      httpVersion: '1.1',
      originalUrl: '/api/user/profile',
      query: {},
    },
    res: {
      statusCode: 200,
    },
    responseTime: 34,
  },
};
