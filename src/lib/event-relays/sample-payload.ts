const SAMPLE_ID = '64f1c0a2b4d0e1f2a3b4c5d6';

export function buildDefaultSamplePayload(resourceIdPath: string): string {
  const path = resourceIdPath.trim() || 'documentId';
  const key = path.split('.')[0];
  return JSON.stringify({ [key]: SAMPLE_ID, status: 'paid' }, null, 2);
}

export const DEFAULT_CREATE_SAMPLE_PAYLOAD =
  buildDefaultSamplePayload('documentId');
