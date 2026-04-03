import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileQuestion, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ModelNotFound() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Model not found</CardTitle>
          <CardDescription className="text-base">
            The requested model does not exist or may have been deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-3">
            <Link href="/database/models-new">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Models
              </Button>
            </Link>
            <Link href="/database/models-new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Model
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
