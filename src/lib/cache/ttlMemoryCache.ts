import 'server-only';

type CacheEntry<T> = { value: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

/**
 * In-memory TTL cache for server-only code (replaces unstable_cache for short-lived probes).
 *
 * Scope: one Node process only — not shared across horizontal replicas or serverless instances.
 * For cross-instance caching, use Next.js `use cache` / `cacheComponents` or an external store.
 */
export async function withTtlCache<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.value;
  }
  const value = await factory();
  store.set(key, {
    value,
    expiresAt: now + ttlSeconds * 1000,
  });
  return value;
}
