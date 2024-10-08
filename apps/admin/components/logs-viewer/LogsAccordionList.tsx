import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

type LogsAccordionListProps = {
  className?: string;
};

export function LogsAccordionList({ className }: LogsAccordionListProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        'w-full h-full my-4 overflow-x-auto main-scrollbar',
        className
      )}
    >
      {dummyLogs.map((log, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="my-2 transition-opacity duration-200 border rounded-md bg-background hover:bg-secondary border-input"
        >
          <AccordionTrigger className="px-3 py-2 hover:no-underline text-medium">
            {log}
          </AccordionTrigger>
          <AccordionContent className="px-3 py-2">
            <pre>Metadata</pre>
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
