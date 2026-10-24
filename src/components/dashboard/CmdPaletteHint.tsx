'use client';

import { Search } from 'lucide-react';
import { useModKey } from '@/lib/hooks/useOS';

export function CmdPaletteHint() {
  const modKey = useModKey();

  return (
    <button
      onClick={() =>
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'k', metaKey: true })
        )
      }
      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground/60 transition-colors duration-100 hover:border-border hover:text-muted-foreground"
    >
      <Search className="size-3.5" />
      <span>Search or jump to...</span>
      <kbd className="ml-1 rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">
        {modKey}K
      </kbd>
    </button>
  );
}
