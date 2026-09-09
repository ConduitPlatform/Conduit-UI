import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfigEditForm } from './config-edit-form';
import type { EmbeddingConfig } from '@/lib/models/embeddings/config';
import type { EmbeddingSchemaFormChoice } from '@/lib/models/embeddings/source-fields';
import type { ConfigProviderChoice } from '@/lib/models/embeddings/config-catalogue';

const refresh = vi.fn();
const push = vi.fn();
const toast = vi.fn();
const upsertEmbeddingConfig = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  toast: (...args: unknown[]) => toast(...args),
}));

vi.mock('@/lib/api/embeddings', () => ({
  upsertEmbeddingConfig: (...args: unknown[]) => upsertEmbeddingConfig(...args),
  deleteEmbeddingConfig: vi.fn(),
}));

const config: EmbeddingConfig = {
  _id: 'cfg_1',
  schemaName: 'Product',
  sourceFields: ['title'],
  targetField: 'embedding',
  provider: 'openai-compatible',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  similarity: 'cosine',
  enabled: true,
};

const schemas: EmbeddingSchemaFormChoice[] = [
  {
    name: 'Product',
    fields: [
      { name: 'title', eligible: true },
      { name: 'description', eligible: true },
    ],
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
];

function renderForm(next: EmbeddingConfig = config) {
  return render(
    <ConfigEditForm
      config={next}
      schemas={schemas}
      providers={providers}
      modelBlocked={false}
      enableAllowed
    />
  );
}

describe('ConfigEditForm', () => {
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
    push.mockReset();
    toast.mockReset();
    upsertEmbeddingConfig.mockReset();
  });

  it('resets from a disabled pending-index upsert and stays clean', async () => {
    const saved: EmbeddingConfig = {
      ...config,
      sourceFields: ['title', 'description'],
      enabled: false,
      model: 'text-embedding-3-large',
      dimensions: 3072,
    };
    upsertEmbeddingConfig.mockResolvedValue({
      config: saved,
      warnings: [
        'Config stayed disabled until the matching index is queryable.',
      ],
    });

    const view = renderForm();
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: 'description' }));
    expect(screen.getByRole('button', { name: /Save changes/ })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /Save changes/ }));

    const dialog = await screen.findByRole('alertdialog');
    expect(
      within(dialog).getByText('Save material changes?')
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Save changes' })
    );

    await waitFor(() => {
      expect(upsertEmbeddingConfig).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Enabled' })).not.toBeChecked();
    });
    expect(screen.getByRole('combobox', { name: 'Model' })).toHaveTextContent(
      'text-embedding-3-large'
    );
    expect(screen.getByLabelText('Dimensions')).toHaveValue(3072);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Config saved',
      description:
        'Config stayed disabled until the matching index is queryable.',
    });

    view.rerender(
      <ConfigEditForm
        config={config}
        schemas={schemas}
        providers={providers}
        modelBlocked={false}
        enableAllowed
      />
    );
    expect(screen.getByRole('switch', { name: 'Enabled' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    view.rerender(
      <ConfigEditForm
        config={saved}
        schemas={schemas}
        providers={providers}
        modelBlocked={false}
        enableAllowed={false}
      />
    );
    expect(screen.getByRole('switch', { name: 'Enabled' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('keeps unsaved edits when config props change', async () => {
    const view = renderForm();
    fireEvent.click(screen.getByRole('checkbox', { name: 'description' }));
    expect(screen.getByRole('checkbox', { name: 'description' })).toBeChecked();
    expect(screen.getByRole('button', { name: /Save changes/ })).toBeEnabled();

    view.rerender(
      <ConfigEditForm
        config={{
          ...config,
          model: 'text-embedding-3-large',
          dimensions: 3072,
        }}
        schemas={schemas}
        providers={providers}
        modelBlocked={false}
        enableAllowed
      />
    );

    expect(screen.getByRole('checkbox', { name: 'description' })).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Model' })).toHaveTextContent(
      'text-embedding-3-small'
    );
    expect(screen.getByRole('button', { name: /Save changes/ })).toBeEnabled();
  });

  it('resets a clean form when persisted config changes', async () => {
    const view = renderForm();
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked();

    view.rerender(
      <ConfigEditForm
        config={{ ...config, enabled: false }}
        schemas={schemas}
        providers={providers}
        modelBlocked={false}
        enableAllowed={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Enabled' })).not.toBeChecked();
    });
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });
});
