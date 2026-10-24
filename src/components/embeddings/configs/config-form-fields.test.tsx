import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ConfigFormFields } from './config-form-fields';
import { EmbeddingConfigFormValues } from './schema';
import { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';
import { EmbeddingSchemaFormChoice } from '@/lib/models/embeddings/source-fields';

const schemas: EmbeddingSchemaFormChoice[] = [
  {
    name: 'Article',
    fields: [{ name: 'title', eligible: true }],
  },
  {
    name: 'Product',
    fields: [{ name: 'title', eligible: true }],
  },
];

const providers: ConfigProviderChoice[] = [
  {
    key: 'openai-compatible',
    models: [
      { name: 'text-embedding-3-small', dimensions: 1536 },
      { name: 'text-embedding-3-large', dimensions: 3072 },
    ],
  },
  {
    key: 'voyage',
    models: [{ name: 'voyage-3', dimensions: 1024 }],
  },
];

function Harness({
  providerCount = 2,
  modelBlocked = false,
}: {
  providerCount?: number;
  modelBlocked?: boolean;
}) {
  const form = useForm<EmbeddingConfigFormValues>({
    defaultValues: {
      schemaName: '',
      sourceFields: [],
      targetField: '',
      provider: 'openai-compatible',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      similarity: 'cosine',
      enabled: false,
    },
  });
  return (
    <FormProvider {...form}>
      <ConfigFormFields
        schemas={schemas}
        providers={providers.slice(0, providerCount)}
        enableAllowed={false}
        modelBlocked={modelBlocked}
      />
      <output data-testid="dimensions">{form.watch('dimensions')}</output>
      <output data-testid="model">{form.watch('model')}</output>
    </FormProvider>
  );
}

describe('ConfigFormFields', () => {
  beforeAll(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    Element.prototype.scrollIntoView = () => {};
  });
  afterEach(() => {
    cleanup();
  });

  it('filters models and keeps keyboard selection', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Model' }));
    const search = screen.getByPlaceholderText('Search models');
    fireEvent.change(search, { target: { value: 'large' } });
    expect(
      screen.getByRole('option', { name: 'text-embedding-3-large' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'text-embedding-3-small' })
    ).toBeNull();
    fireEvent.keyDown(search, { key: 'Escape' });
  });

  it('filters schemas and keeps keyboard selection', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Schema' }));
    const search = screen.getByPlaceholderText('Search schemas');
    fireEvent.change(search, { target: { value: 'prod' } });
    expect(screen.getByRole('option', { name: 'Product' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Article' })).toBeNull();
    fireEvent.change(search, { target: { value: 'missing' } });
    expect(screen.getByText('No matching schemas')).toBeInTheDocument();
    fireEvent.keyDown(search, { key: 'Escape' });
  });

  it('derives dimensions from the selected catalogue model', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Model' }));
    fireEvent.click(
      screen.getByRole('option', { name: 'text-embedding-3-large' })
    );
    expect(screen.getByTestId('dimensions')).toHaveTextContent('3072');
    expect(screen.getByLabelText('Dimensions')).toHaveAttribute('readonly');
  });

  it('clears an incompatible model when the provider changes', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Provider' }));
    fireEvent.click(screen.getByRole('option', { name: 'voyage' }));
    expect(screen.getByTestId('model')).toHaveTextContent('');
    expect(screen.getByTestId('dimensions')).toHaveTextContent('0');
  });

  it('keeps a single provider visible and disabled', () => {
    render(<Harness providerCount={1} />);
    const provider = screen.getByRole('combobox', { name: 'Provider' });
    expect(provider).toBeDisabled();
    expect(provider).toHaveTextContent('openai-compatible');
  });

  it('explains dimensions and the selected similarity', () => {
    render(<Harness />);
    expect(
      screen.getByText(
        'Must match the model and the index. Changing it requires a rebuild and backfill.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Recommended for text/)).toBeInTheDocument();
  });

  it('blocks a missing catalogue model with a settings link', () => {
    render(<Harness modelBlocked />);
    expect(
      screen.getByText(/not in the provider catalogue/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open settings' })).toHaveAttribute(
      'href',
      '/embeddings/settings'
    );
    expect(screen.getByRole('combobox', { name: 'Model' })).toBeDisabled();
  });
});
