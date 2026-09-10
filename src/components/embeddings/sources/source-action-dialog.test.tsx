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

  it('treats disable as a reversible pause and enable as resume', () => {
    const { rerender } = render(
      <SourceActionDialog
        action="disable"
        onOpenChange={() => undefined}
        onConfirm={() => undefined}
      />
    );
    expect(
      screen.getByText(/You can enable the source again later/)
    ).toBeInTheDocument();
    rerender(
      <SourceActionDialog
        action="enable"
        onOpenChange={() => undefined}
        onConfirm={() => undefined}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Enable this source?' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enable source' })).toBeTruthy();
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
