import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isCancelShortcut,
  isSaveShortcut,
  isShortcutOverlayOpen,
  useSaveShortcut,
} from './use-save-shortcut';

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  });
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('isSaveShortcut', () => {
  it('accepts Cmd or Ctrl+S and ignores Alt, repeats, and composing', () => {
    expect(isSaveShortcut(keyEvent({ key: 's', metaKey: true }))).toBe(true);
    expect(isSaveShortcut(keyEvent({ key: 'S', ctrlKey: true }))).toBe(true);
    expect(
      isSaveShortcut(keyEvent({ key: 's', metaKey: true, altKey: true }))
    ).toBe(false);
    expect(isSaveShortcut(keyEvent({ key: 's' }))).toBe(false);
    expect(
      isSaveShortcut(keyEvent({ key: 's', metaKey: true, repeat: true }))
    ).toBe(false);
    expect(
      isSaveShortcut(keyEvent({ key: 's', metaKey: true, isComposing: true }))
    ).toBe(false);
  });

  it('still matches when the event target is an input', () => {
    const input = document.createElement('input');
    document.body.append(input);
    const event = keyEvent({ key: 's', metaKey: true });
    Object.defineProperty(event, 'target', { value: input });
    expect(isSaveShortcut(event)).toBe(true);
  });

  it('ignores an already prevented event', () => {
    const event = keyEvent({ key: 's', metaKey: true });
    event.preventDefault();
    expect(isSaveShortcut(event)).toBe(false);
  });
});

describe('dialog guards', () => {
  it('blocks save and cancel while a dialog or alertdialog is open', () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-state', 'open');
    document.body.append(dialog);
    expect(isShortcutOverlayOpen()).toBe(true);
    expect(isSaveShortcut(keyEvent({ key: 's', metaKey: true }))).toBe(false);
    expect(isCancelShortcut(keyEvent({ key: 'Escape' }))).toBe(false);

    dialog.setAttribute('data-state', 'closed');
    expect(isShortcutOverlayOpen()).toBe(false);
    expect(isSaveShortcut(keyEvent({ key: 's', ctrlKey: true }))).toBe(true);
  });

  it('treats an open alertdialog as an overlay', () => {
    const alert = document.createElement('div');
    alert.setAttribute('role', 'alertdialog');
    alert.setAttribute('data-state', 'open');
    document.body.append(alert);
    expect(isShortcutOverlayOpen()).toBe(true);
  });
});

describe('useSaveShortcut', () => {
  it('prevents default and saves when enabled', () => {
    const onSave = vi.fn();
    renderHook(() => useSaveShortcut(true, onSave));
    const event = keyEvent({ key: 's', metaKey: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('does not save when disabled or a dialog is open', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useSaveShortcut(enabled, onSave),
      { initialProps: { enabled: false } }
    );
    window.dispatchEvent(keyEvent({ key: 's', metaKey: true }));
    expect(onSave).not.toHaveBeenCalled();

    rerender({ enabled: true });
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-state', 'open');
    document.body.append(dialog);
    window.dispatchEvent(keyEvent({ key: 's', metaKey: true }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
