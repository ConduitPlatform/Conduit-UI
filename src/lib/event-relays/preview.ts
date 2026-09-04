import { lookupOwnPath } from './path.ts';
import { renderMessageTemplate } from './template.ts';

export type RelayPreview = {
  resourceId?: string;
  payload?: unknown;
  error?: string;
};

export function previewEventRelay(options: {
  resourceIdPath: string;
  messageTemplate: unknown;
  samplePayload: unknown;
}): RelayPreview {
  try {
    const resourceId = lookupOwnPath(
      options.samplePayload,
      options.resourceIdPath
    );
    if (resourceId === undefined) {
      return {
        error: `Resource ID path '${options.resourceIdPath}' was not found`,
      };
    }
    const payload = renderMessageTemplate(
      options.messageTemplate,
      options.samplePayload
    );
    return { resourceId: String(resourceId), payload };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
