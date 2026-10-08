'use client';

import { useEffect, useState } from 'react';

export function isShortcutOverlayOpen(): boolean {
  return Boolean(
    document.querySelector('[role="alertdialog"][data-state="open"]') ||
    document.querySelector('[role="dialog"][data-state="open"]')
  );
}

export function isSaveShortcut(event: KeyboardEvent): boolean {
  if (event.isComposing || event.repeat || event.defaultPrevented) return false;
  if (!(event.metaKey || event.ctrlKey)) return false;
  if (event.altKey) return false;
  if (event.key.toLowerCase() !== 's') return false;
  if (isShortcutOverlayOpen()) return false;
  return true;
}

export function isCancelShortcut(event: KeyboardEvent): boolean {
  if (event.isComposing || event.repeat || event.defaultPrevented) return false;
  if (event.key !== 'Escape') return false;
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  if (isShortcutOverlayOpen()) return false;
  return true;
}

export function saveShortcutPresentation(platform: string): {
  label: string;
  aria: string;
} {
  const isApple = /Mac|iPhone|iPad|iPod/i.test(platform);
  return {
    label: isApple ? '⌘S' : 'Ctrl+S',
    aria: isApple ? 'Meta+s' : 'Control+s',
  };
}

export function useSaveShortcut(enabled: boolean, onSave: () => void): void {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSaveShortcut(event)) return;
      event.preventDefault();
      onSave();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onSave]);
}

export function useSaveShortcutLabel(): string {
  const [label, setLabel] = useState('Ctrl+S');
  useEffect(() => {
    setLabel(saveShortcutPresentation(navigator.userAgent).label);
  }, []);
  return label;
}

export function useSaveShortcutHint(): { label: string; aria: string } {
  const [hint, setHint] = useState({
    label: 'Ctrl+S',
    aria: 'Control+s',
  });
  useEffect(() => {
    setHint(saveShortcutPresentation(navigator.userAgent));
  }, []);
  return hint;
}
