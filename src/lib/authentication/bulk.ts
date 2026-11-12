export const BULK_CONCURRENCY = 4;
export const BULK_LIMIT = 25;

export type BulkFailure = {
  id: string;
  message: string;
};

export type BulkResult = {
  ok: string[];
  failed: BulkFailure[];
};

function failureMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

/**
 * Runs `fn` over `ids` with a fixed number of in-flight calls.
 * A rejection is recorded for that id; the rest continue.
 */
export async function runBulk(
  ids: readonly string[],
  fn: (id: string) => Promise<unknown>,
  options?: {
    concurrency?: number;
    onProgress?: (done: number, total: number) => void;
  }
): Promise<BulkResult> {
  const concurrency = Math.max(1, options?.concurrency ?? BULK_CONCURRENCY);
  const ok: string[] = [];
  const failed: BulkFailure[] = [];
  const total = ids.length;
  let cursor = 0;
  let done = 0;

  async function worker(): Promise<void> {
    while (cursor < ids.length) {
      const index = cursor;
      cursor += 1;
      const id = ids[index];
      if (id === undefined) continue;
      try {
        await fn(id);
        ok.push(id);
      } catch (error) {
        failed.push({ id, message: failureMessage(error) });
      } finally {
        done += 1;
        options?.onProgress?.(done, total);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(ids.length, 1)) },
    () => worker()
  );
  if (ids.length > 0) await Promise.all(workers);
  return { ok, failed };
}

export function bulkDeletePhrase(count: number): string {
  return `delete ${count} ${count === 1 ? 'user' : 'users'}`;
}
