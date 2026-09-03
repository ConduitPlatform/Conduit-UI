import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, Upload, X, FileText, AlertTriangle } from 'lucide-react';

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onImport?: (json: any) => void;
  importInfo?: string;
  onExport?: () => void;
  exportInfo?: string;
}

const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  open,
  onOpenChange,
  title,
  onImport,
  importInfo,
  onExport,
  exportInfo,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) setError(undefined);
  }, [open]);

  const generateTitle = (title?: string) => {
    return `Export / Import${title ? ` - ${title}` : ''}`;
  };

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target?.files?.[0]) return;
      new Response(e.target.files[0]).json().then(
        json => {
          setError(undefined);
          onImport?.(json);
        },
        () => {
          setError('Could not parse json file for import');
        }
      );
    },
    [onImport]
  );

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {generateTitle(title)}
          </DialogTitle>
          <DialogDescription>
            Export your data to a JSON file or import data from a previously
            exported file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {onExport && (
            <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-primary" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Download a JSON file containing all {title?.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportInfo && (
                  <div className="flex items-start gap-2 p-3 bg-callout-info-muted border border-callout-info rounded-lg">
                    <FileText className="h-4 w-4 text-callout-info-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-callout-info-foreground">
                      {exportInfo}
                    </p>
                  </div>
                )}
                <Button
                  onClick={onExport}
                  variant="default"
                  className="w-full group"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                  Export {title}
                </Button>
              </CardContent>
            </Card>
          )}

          {onImport && (
            <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-primary" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Upload a JSON file to import {title?.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {importInfo && (
                  <div className="flex items-start gap-2 p-3 bg-callout-warning-muted border border-callout-warning rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-callout-warning-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-callout-warning-foreground font-medium">
                      {importInfo}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="w-full group"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Choose File
                </Button>
                <input
                  type="file"
                  ref={inputRef}
                  onChange={handleFileChange}
                  accept="application/JSON"
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive w-full sm:w-auto">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportImportDialog;
