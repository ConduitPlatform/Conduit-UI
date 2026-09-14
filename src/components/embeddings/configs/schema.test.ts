import { describe, expect, it } from 'vitest';
import type { EmbeddingConfig } from '@/lib/models/embeddings/config';
import {
  configFormSignature,
  shouldResetConfigForm,
  toConfigFormValues,
} from './schema';

const config: EmbeddingConfig = {
  _id: 'cfg_1',
  schemaName: 'Product',
  sourceFields: ['title', 'body'],
  targetField: 'embedding',
  provider: 'openai-compatible',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  similarity: 'cosine',
  enabled: true,
};

describe('config form sync', () => {
  it('maps persisted config including backend-forced fields', () => {
    expect(
      toConfigFormValues({
        ...config,
        enabled: false,
        model: 'text-embedding-3-large',
        dimensions: 3072,
      })
    ).toEqual({
      schemaName: 'Product',
      sourceFields: ['title', 'body'],
      targetField: 'embedding',
      provider: 'openai-compatible',
      model: 'text-embedding-3-large',
      dimensions: 3072,
      similarity: 'cosine',
      enabled: false,
    });
  });

  it('treats source field order as the same signature', () => {
    const left = toConfigFormValues(config);
    const right = toConfigFormValues({
      ...config,
      sourceFields: ['body', 'title'],
    });
    expect(configFormSignature(left)).toBe(configFormSignature(right));
  });

  it('resets on identity change even when dirty', () => {
    expect(
      shouldResetConfigForm({
        incomingId: 'cfg_2',
        incomingSignature: 'next',
        appliedId: 'cfg_1',
        appliedSignature: 'current',
        dirty: true,
      })
    ).toBe(true);
  });

  it('skips the same persisted snapshot', () => {
    expect(
      shouldResetConfigForm({
        incomingId: 'cfg_1',
        incomingSignature: 'same',
        appliedId: 'cfg_1',
        appliedSignature: 'same',
        dirty: false,
      })
    ).toBe(false);
  });

  it('skips stale props after an upsert while waiting for refresh', () => {
    const stale = configFormSignature(toConfigFormValues(config));
    const saved = configFormSignature(
      toConfigFormValues({ ...config, enabled: false })
    );
    expect(
      shouldResetConfigForm({
        incomingId: 'cfg_1',
        incomingSignature: stale,
        appliedId: 'cfg_1',
        appliedSignature: saved,
        dirty: false,
        ignoredIncomingSignature: stale,
      })
    ).toBe(false);
  });

  it('does not clobber unsaved edits when props change', () => {
    expect(
      shouldResetConfigForm({
        incomingId: 'cfg_1',
        incomingSignature: 'server',
        appliedId: 'cfg_1',
        appliedSignature: 'local',
        dirty: true,
      })
    ).toBe(false);
  });

  it('resets a clean form onto a material server change', () => {
    expect(
      shouldResetConfigForm({
        incomingId: 'cfg_1',
        incomingSignature: 'server',
        appliedId: 'cfg_1',
        appliedSignature: 'local',
        dirty: false,
      })
    ).toBe(true);
  });
});
