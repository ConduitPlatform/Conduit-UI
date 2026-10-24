import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FunctionsTestPage() {
  return (
    <div className="p-6 max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Functions test</CardTitle>
          <CardDescription>
            Upload a function, then open it from the list to view execution
            history. Invocations are triggered by your application routes or
            scheduled jobs — there is no generic &quot;re-run&quot; in the admin
            API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/functions/functions">All functions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/functions/functions/new">Upload function</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/functions/settings">Module settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
