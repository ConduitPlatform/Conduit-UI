import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Download,
  Upload,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onImport?: (json: unknown) => void | Promise<void>;
  importInfo?: string;
  onExport?: () => void;
  exportInfo?: string;
  confirmImport?: boolean;
}

function countImportedItems(payload: unknown) {
  if (Array.isArray(payload)) return payload.length;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.customEndpoints)) {
      return record.customEndpoints.length;
    }
    if (Array.isArray(record.endpoints)) {
      return record.endpoints.length;
    }
    if (Array.isArray(record.schemas)) {
      return record.schemas.length;
    }
  }
  return 1;
}

const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  open,
  onOpenChange,
  title,
  onImport,
  importInfo,
  onExport,
  exportInfo,
  confirmImport = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [pendingImport, setPendingImport] = useState<unknown | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(undefined);
      setPendingImport(null);
      setIsImporting(false);
    }
  }, [open]);

  const generateTitle = (dialogTitle?: string) => {
    return `Export / Import${dialogTitle ? ` - ${dialogTitle}` : ''}`;
  };

  const pendingCount = useMemo(
    () => (pendingImport == null ? 0 : countImportedItems(pendingImport)),
    [pendingImport]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0];
      e.target.value = '';
      if (!file) return;
      new Response(file).json().then(
        json => {
          setError(undefined);
          if (confirmImport) {
            setPendingImport(json);
            return;
          }
          void onImport?.(json);
        },
        () => {
          setError('Could not parse JSON file for import');
        }
      );
    },
    [confirmImport, onImport]
  );

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirmImport = async () => {
    if (pendingImport == null) return;
    setIsImporting(true);
    try {
      await onImport?.(pendingImport);
      setPendingImport(null);
      onOpenChange(false);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : 'Failed to import file'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {onExport && (
              <Card className="border-2 border-dashed border-muted-foreground/20 transition-shadow hover:border-muted-foreground/40 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-5 w-5 text-primary" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Download a JSON file containing all {title?.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {exportInfo && (
                    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {exportInfo}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={onExport}
                    variant="default"
                    className="w-full"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export {title}
                  </Button>
                </CardContent>
              </Card>
            )}

            {onImport && (
              <Card className="border-2 border-dashed border-muted-foreground/20 transition-shadow hover:border-muted-foreground/40 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-primary" />
                    Import Data
                  </CardTitle>
                  <CardDescription>
                    Upload a JSON file to import {title?.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {importInfo && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <p className="text-sm font-medium text-destructive">
                        {importInfo}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleUploadClick}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept="application/json,.json"
                    className="hidden"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {error && (
              <div className="flex w-full items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive sm:w-auto">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex w-full gap-2 sm:w-auto">
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

      <AlertDialog
        open={pendingImport != null}
        onOpenChange={openConfirm => {
          if (!openConfirm && !isImporting) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import {title?.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will import {pendingCount}{' '}
              {pendingCount === 1 ? 'item' : 'items'}
              {importInfo ? `. ${importInfo}` : '.'} Continue only if you
              reviewed the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isImporting}
              onClick={event => {
                event.preventDefault();
                void handleConfirmImport();
              }}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                'Import'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExportImportDialog;
