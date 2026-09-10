import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SourceActionDialog } from './source-action-dialog';

afterEach(() => {
  cleanup();
});

describe('SourceActionDialog', () => {
  it('confirms destructive purge copy and closes on cancel', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <SourceActionDialog
        action="purge"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Purge this source?' })
    ).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
    screen.getByRole('button', { name: 'Cancel' }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('uses reconcile copy that mentions backfill', () => {
    render(
      <SourceActionDialog
        action="reconcile"
        onOpenChange={() => undefined}
        onConfirm={() => undefined}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Reconcile storage files?' })
    ).toBeInTheDocument();
    expect(screen.getByText(/also covers backfill/)).toBeInTheDocument();
  });
});
