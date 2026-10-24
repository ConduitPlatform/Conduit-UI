'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

interface HtmlViewerProps {
  html: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const HtmlViewer: React.FC<HtmlViewerProps> = ({
  html,
  templateName,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast({
        title: 'Copied',
        description: 'HTML copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy HTML',
      });
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'HTML file downloaded',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Template HTML: {templateName}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadHtml}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This is the raw HTML content of the template. You can copy this
              for reference or download it as a file.
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
              {html}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
