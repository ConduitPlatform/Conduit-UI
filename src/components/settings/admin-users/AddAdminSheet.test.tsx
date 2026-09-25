import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AddAdminSheet } from '@/components/settings/admin-users/AddAdminSheet';
import { AlertProvider } from '@/components/providers/AlertProvider';

const refresh = vi.fn();
const toast = vi.fn();
const postNewAdminUser = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  toast: (...args: unknown[]) => toast(...args),
}));

vi.mock('@/lib/api/settings/admins', () => ({
  postNewAdminUser: (...args: unknown[]) => postNewAdminUser(...args),
}));

function OpenSheetHarness({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <AlertProvider>
      <AddAdminSheet
        open={open}
        onOpenChange={next => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <button type="button">Create</button>
      </AddAdminSheet>
    </AlertProvider>
  );
}

function renderSheet() {
  return render(<OpenSheetHarness />);
}

describe('AddAdminSheet', () => {
  beforeAll(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    Element.prototype.scrollIntoView = () => {};
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });

  afterEach(() => {
    cleanup();
    refresh.mockReset();
    toast.mockReset();
    postNewAdminUser.mockReset();
  });

  it('keeps username and password inputs controlled with empty defaults', () => {
    renderSheet();
    expect(screen.getByPlaceholderText('Enter a username')).toHaveAttribute(
      'value',
      ''
    );
    const [password, confirm] = screen.getAllByPlaceholderText('very secret');
    expect(password).toHaveAttribute('value', '');
    expect(confirm).toHaveAttribute('value', '');
  });

  it('closes after a successful create without tripping the unsaved-changes alert', async () => {
    postNewAdminUser.mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(<OpenSheetHarness onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByPlaceholderText('Enter a username'), {
      target: { value: 'uiadmin1' },
    });
    const [password, confirm] = screen.getAllByPlaceholderText('very secret');
    fireEvent.change(password, { target: { value: 'secretpass' } });
    fireEvent.change(confirm, { target: { value: 'secretpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(postNewAdminUser).toHaveBeenCalledWith('uiadmin1', 'secretpass');
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(
      screen.queryByText(/unsaved changes will be lost/i)
    ).not.toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });
});
