'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Upload, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { fileUpload } from '@/lib/api/storage';
import { useStorageBrowse } from './StorageBrowseProvider';
import { useToast } from '@/lib/hooks/use-toast';
import axios from 'axios';
import { cn } from '@/lib/utils';

type UploadItem = {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
};

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { container, path, addFileToList } = useStorageBrowse();
  const { toast } = useToast();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const updateUpload = (index: number, update: Partial<UploadItem>) => {
    setUploads(prev =>
      prev.map((u, i) => (i === index ? { ...u, ...update } : u))
    );
  };

  const uploadFile = async (item: UploadItem, index: number) => {
    if (!container) return;
    updateUpload(index, { status: 'uploading', progress: 0 });
    try {
      const response = await fileUpload({
        alias: item.file.name,
        mimeType: item.file.type || 'application/octet-stream',
        folder: path,
        container,
        size: item.file.size,
        isPublic: false,
      });
      await axios.put(response.url, item.file, {
        headers: {
          'Content-Type': item.file.type || 'application/octet-stream',
          'x-ms-blob-type': 'BlockBlob',
        },
        onUploadProgress: progressEvent => {
          const percent = Math.round(
            (progressEvent.loaded / item.file.size) * 100
          );
          updateUpload(index, { progress: percent });
        },
      });
      updateUpload(index, { status: 'done', progress: 100 });
      addFileToList(response.file);
    } catch {
      updateUpload(index, { status: 'error', error: 'Upload failed' });
    }
  };

  const startUpload = async () => {
    setUploading(true);
    const pending = uploads.filter(u => u.status === 'pending');
    await Promise.allSettled(
      pending.map(item => {
        const actualIndex = uploads.indexOf(item);
        return uploadFile(item, actualIndex);
      })
    );
    setUploading(false);
    const allDone = uploads.every(
      u => u.status === 'done' || u.status === 'error'
    );
    if (allDone) {
      toast({
        title: 'Storage',
        description: `Upload complete`,
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: UploadItem[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploads(prev => [...prev, ...newUploads]);
  }, []);

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = (open: boolean) => {
    if (!uploading) {
      setUploads([]);
      onOpenChange(open);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  });

  const hasPending = uploads.some(u => u.status === 'pending');
  const allComplete =
    uploads.length > 0 && uploads.every(u => u.status === 'done');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm">Drop files here...</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Any file type supported
                </p>
              </>
            )}
          </div>
        </div>

        {uploads.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploads.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024).toFixed(1)} KB
                  </p>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-1.5 mt-1" />
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === 'done' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  {item.status === 'pending' && !uploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeUpload(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground">
                      {item.progress}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          {allComplete ? (
            <Button onClick={() => handleClose(false)}>Done</Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={startUpload} disabled={!hasPending || uploading}>
                {uploading
                  ? 'Uploading...'
                  : `Upload ${uploads.filter(u => u.status === 'pending').length} file${uploads.filter(u => u.status === 'pending').length !== 1 ? 's' : ''}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
