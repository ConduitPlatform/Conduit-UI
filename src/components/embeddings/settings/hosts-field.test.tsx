import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { HostsField } from './hosts-field';
import { EmbeddingsSettingsFormValues } from '@/lib/models/embeddings/settings-form';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';

function HostsHarness() {
  const form = useForm<EmbeddingsSettingsFormValues>({
    defaultValues: {
      defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKey: '',
      apiKeyConfigured: true,
      model: 'text-embedding-3-small',
      allowedHosts: ['api.openai.com'],
      queue: {
        concurrency: 2,
        attempts: 3,
        maxBatchSize: 500,
        drainTimeoutMs: 15 * 60 * 1000,
      },
      security: {
        requireGrpcKey: false,
        sourceFieldAllowlist: [],
        maxMutationEventIds: 500,
        embedTimeoutMs: 10_000,
        maxEmbedInputBytes: 32 * 1024,
        maxEmbedResponseBytes: 1024 * 1024,
      },
    },
  });
  return (
    <FormProvider {...form}>
      <HostsField
        name="allowedHosts"
        label="Allowed hosts"
        description="Provider hosts"
      />
    </FormProvider>
  );
}

describe('HostsField', () => {
  it('does not delete a chip when Backspace is pressed on an empty draft', () => {
    render(<HostsHarness />);
    const input = screen.getByLabelText('Add allowed hosts');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(screen.getByText('api.openai.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove api.openai.com' })
    ).toBeInTheDocument();
  });
});
