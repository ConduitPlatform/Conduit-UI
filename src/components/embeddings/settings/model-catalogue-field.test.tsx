import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';
import { ModelCatalogueField } from './model-catalogue-field';
import { EmbeddingsSettingsFormValues } from '@/lib/models/embeddings/settings-form';
import { OPENAI_COMPATIBLE_PROVIDER } from '@/lib/models/embeddings/settings';

function CatalogueHarness({
  defaultModel = 'text-embedding-3-small',
}: {
  defaultModel?: string;
}) {
  const form = useForm<EmbeddingsSettingsFormValues>({
    defaultValues: {
      defaultProvider: OPENAI_COMPATIBLE_PROVIDER,
      endpoint: 'https://api.openai.com/v1/embeddings',
      apiKey: '',
      apiKeyConfigured: true,
      models: [{ name: 'text-embedding-3-small', dimensions: 1536 }],
      defaultModel,
      queue: {
        concurrency: 2,
        attempts: 3,
        maxBatchSize: 500,
        drainTimeoutMs: 15 * 60 * 1000,
      },
      security: {
        maxMutationEventIds: 500,
        embedTimeoutMs: 10_000,
        maxEmbedInputBytes: 32 * 1024,
        maxEmbedResponseBytes: 1024 * 1024,
      },
    },
  });
  return (
    <FormProvider {...form}>
      <ModelCatalogueField disabled={false} />
    </FormProvider>
  );
}

describe('ModelCatalogueField', () => {
  afterEach(() => {
    cleanup();
  });
  it('keeps the selected default row until the default is cleared', () => {
    render(<CatalogueHarness />);
    expect(
      screen.getByRole('button', {
        name: 'Clear or change the default model before removing this row',
      })
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add model' }));
    expect(screen.getAllByLabelText('Model name')).toHaveLength(2);
    expect(
      screen.getByRole('button', {
        name: 'Clear or change the default model before removing this row',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Remove model 2' })
    ).toBeEnabled();
  });

  it('allows removing a non-default extra row', () => {
    render(<CatalogueHarness defaultModel="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add model' }));
    const extra = screen.getByRole('button', { name: 'Remove model 2' });
    expect(extra).toBeEnabled();
    fireEvent.click(extra);
    expect(screen.getAllByLabelText('Model name')).toHaveLength(1);
  });
});
