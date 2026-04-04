'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Copy, Download, Trash2, ExternalLink } from 'lucide-react';
import { ConduitFile } from '@/lib/models/storage';
import { getFileById, getFileUrl } from '@/lib/api/storage';
import { useStorageBrowse } from './StorageBrowseProvider';
import { formatFileSize, formatDate } from './columns';
import { mimeTypeMapper } from '@/components/storage/units/file/utils';
import { useToast } from '@/lib/hooks/use-toast';

export function FileDetailsSheet({
  fileId,
  open,
  onOpenChange,
}: {
  fileId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { deleteFile } = useStorageBrowse();
  const { toast } = useToast();
  const [file, setFile] = useState<ConduitFile | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileId || !open) {
      setFile(null);
      setUrl(null);
      return;
    }
    setLoading(true);
    Promise.all([getFileById(fileId), getFileUrl(fileId)])
      .then(([fileData, urlData]) => {
        setFile(fileData);
        setUrl(urlData.result);
      })
      .finally(() => setLoading(false));
  }, [fileId, open]);

  const isImage = file?.mimeType.startsWith('image/');

  const copyUrl = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Storage', description: 'URL copied to clipboard' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>File Details</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}

        {file && !loading && (
          <div className="mt-4 space-y-6">
            {isImage && url && (
              <div className="rounded-lg overflow-hidden border bg-muted">
                <img
                  src={url}
                  alt={file.alias || file.name}
                  className="object-contain w-full max-h-[250px]"
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold">{file.alias}</h3>
              {file.alias !== file.name && (
                <p className="text-sm text-muted-foreground">{file.name}</p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Size</span>
                <p className="font-medium">{formatFileSize(file.size)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium">
                  {mimeTypeMapper[file.mimeType] ?? file.mimeType}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{formatDate(file.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Modified</span>
                <p className="font-medium">{formatDate(file.updatedAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Visibility</span>
                <p>
                  <Badge variant={file.isPublic ? 'default' : 'secondary'}>
                    {file.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Container</span>
                <p className="font-medium">{file.container}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Path</span>
              <p className="text-sm font-medium font-mono break-all mt-0.5">
                {file.container}/{file.folder.replace(/^\/|\/$/g, '') || '/'}
              </p>
            </div>

            {url && (
              <div>
                <span className="text-sm text-muted-foreground">URL</span>
                <div className="flex items-start gap-2 mt-0.5">
                  <p className="text-sm font-mono break-all flex-1">{url}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-7 w-7"
                    onClick={copyUrl}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              {url && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive ml-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete File</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this file? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await deleteFile(file._id);
                        onOpenChange(false);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
