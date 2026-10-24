'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SHORTCUTS, groupShortcuts } from '@/lib/shortcuts';
import { useModKey } from '@/lib/hooks/useOS';

export function ShortcutSheet() {
  const [open, setOpen] = React.useState(false);
  const modKey = useModKey();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const grouped = React.useMemo(() => groupShortcuts(SHORTCUTS), []);
  const needsModifier = (key: string) => !['Escape', 'Enter'].includes(key);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick reference for available shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {Object.entries(grouped).map(([group, shortcuts]) => (
            <div key={group}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group}
              </h3>
              <div className="space-y-1">
                {shortcuts.map(shortcut => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                  >
                    <span>{shortcut.description}</span>
                    <kbd className="pointer-events-none inline-flex h-6 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
                      {needsModifier(shortcut.key) && <span>{modKey}</span>}
                      {shortcut.label}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
