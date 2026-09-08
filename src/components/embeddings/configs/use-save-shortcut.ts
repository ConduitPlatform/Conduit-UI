'use client';

import { useEffect, useState } from 'react';

export function isSaveShortcut(event: KeyboardEvent): boolean {
  if (event.isComposing || event.repeat) return false;
  if (!(event.metaKey || event.ctrlKey)) return false;
  if (event.key.toLowerCase() !== 's') return false;
  if (document.querySelector('[role="alertdialog"][data-state="open"]')) {
    return false;
  }
  return true;
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
    const platform = navigator.userAgent;
    setLabel(/Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘S' : 'Ctrl+S');
  }, []);
  return label;
}
