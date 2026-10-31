import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TwoFaConfigForm } from '@/components/authentication/strategies/settingsConfig/twoFaConfig';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

function renderForm(data?: ComponentProps<typeof TwoFaConfigForm>['data']) {
  const onSubmit = vi.fn();
  render(
    <TwoFaConfigForm
      name="Two Factor Authentication"
      data={data}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />
  );
  return onSubmit;
}

function valuesOf(onSubmit: ReturnType<typeof vi.fn>) {
  return onSubmit.mock.calls[0][0] as {
    issuer: string;
    allowedIssuers: string[];
    backUpCodes: { enabled: boolean };
    enabled: boolean;
    methods: { authenticator: boolean; sms: boolean };
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('TwoFaConfigForm', () => {
  it('fills issuer defaults when an older backend omits them', async () => {
    const onSubmit = renderForm({
      enabled: true,
      methods: { authenticator: true, sms: false },
      backUpCodes: { enabled: false },
    });

    expect(screen.getByRole('textbox', { name: 'Issuer' })).toHaveValue(
      'conduit'
    );
    expect(
      screen.getByText('Shown in authenticator apps when a user enables TOTP.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Client-supplied issuer names the 2FA enable route may accept. An empty list ignores client names.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Generate backup codes' })
    ).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = valuesOf(onSubmit);
    expect(payload).toEqual({
      enabled: true,
      methods: { authenticator: true, sms: false },
      backUpCodes: { enabled: false },
      issuer: 'conduit',
      allowedIssuers: [],
    });
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it('keeps an issuer and allowlist the backend already returned', async () => {
    const onSubmit = renderForm({
      enabled: false,
      methods: { authenticator: true, sms: true },
      backUpCodes: { enabled: true },
      issuer: 'Acme',
      allowedIssuers: ['Acme Mobile'],
    });

    expect(screen.getByRole('textbox', { name: 'Issuer' })).toHaveValue('Acme');
    expect(screen.getByText('Acme Mobile')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(valuesOf(onSubmit).issuer).toBe('Acme');
    expect(valuesOf(onSubmit).allowedIssuers).toEqual(['Acme Mobile']);
  });

  it('saves an edited issuer and allowlist, including names with spaces', async () => {
    const onSubmit = renderForm({
      enabled: true,
      methods: { authenticator: true, sms: false },
      backUpCodes: { enabled: true },
      issuer: 'conduit',
      allowedIssuers: ['Old'],
    });

    const issuer = screen.getByRole('textbox', { name: 'Issuer' });
    fireEvent.change(issuer, { target: { value: 'Acme' } });
    const tags = screen.getAllByRole('textbox').find(field => field !== issuer);
    if (!tags) throw new Error('Allowed issuers input not found');
    fireEvent.change(tags, { target: { value: 'Acme Mobile' } });
    fireEvent.keyDown(tags, { key: ' ' });
    expect(
      screen.queryByRole('button', { name: 'Remove Acme Mobile' })
    ).not.toBeInTheDocument();
    fireEvent.keyDown(tags, { key: 'Enter' });
    expect(
      screen.getByRole('button', { name: 'Remove Acme Mobile' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Old' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(valuesOf(onSubmit).issuer).toBe('Acme');
    expect(valuesOf(onSubmit).allowedIssuers).toEqual(['Acme Mobile']);
  });

  it('does not save a blank issuer', async () => {
    const onSubmit = renderForm({
      enabled: true,
      methods: { authenticator: true, sms: false },
      backUpCodes: { enabled: true },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Issuer' }), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Enter an issuer name')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
