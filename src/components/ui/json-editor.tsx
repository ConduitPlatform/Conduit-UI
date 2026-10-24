'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Copy, Check } from 'lucide-react';

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  height?: string;
  readOnly?: boolean;
}

export function JsonEditor({
  value,
  onChange,
  height = '400px',
  readOnly = false,
}: JsonEditorProps) {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Format the JSON with proper indentation
  useEffect(() => {
    try {
      const formatted = JSON.stringify(value, null, 2);
      setJsonString(formatted);
      setError(null);
    } catch (err) {
      setError('Invalid JSON object');
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonString(newValue);
    try {
      const parsed = JSON.parse(newValue);
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError(
        'Invalid JSON: ' + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonString(formatted);
      setError(null);
    } catch (err) {
      // If we can't parse it, don't change anything
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!!error}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormat}
            disabled={!!error}
          >
            Format
          </Button>
        )}
      </div>

      <Textarea
        value={jsonString}
        onChange={e => handleChange(e.target.value)}
        className={`font-mono text-sm ${error ? 'border-destructive' : ''}`}
        style={{ height, resize: 'vertical' }}
        disabled={readOnly}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
