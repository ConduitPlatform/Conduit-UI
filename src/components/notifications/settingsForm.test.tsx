import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { SettingsForm } from '@/components/notifications/settingsForm';
import type { NotificationSettings } from '@/lib/models/Notification';

const PEM =
  '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC\nBKcwggSjAgEAAoIBAQC7\n-----END PRIVATE KEY-----\n';

let latestValues: Record<string, unknown> = {};

function Harness() {
  const form = useForm({
    defaultValues: {
      providerName: 'firebase',
      projectId: 'project',
      clientEmail: 'svc@project.iam.gserviceaccount.com',
      privateKey: '',
    },
  });
  latestValues = form.watch();
  return (
    <Form {...form}>
      <SettingsForm
        control={form.control}
        edit
        setEdit={vi.fn()}
        handleFileChange={vi.fn()}
        data={{ providerName: 'firebase' } as unknown as NotificationSettings}
        watch={form.watch}
        reset={form.reset}
      />
    </Form>
  );
}

afterEach(() => {
  cleanup();
  latestValues = {};
});

describe('push notification settings form', () => {
  it('keeps the line breaks of a multiline firebase private key', () => {
    render(<Harness />);
    const field = screen.getByTitle('private key');
    expect(field.tagName).toBe('TEXTAREA');

    fireEvent.change(field, { target: { value: PEM } });

    expect((field as HTMLTextAreaElement).value).toBe(PEM);
    expect(latestValues.privateKey).toBe(PEM);
  });
});
