export function deriveAdminSocketUrl(
  apiBaseUrl: string,
  explicit?: string | null
): string {
  return deriveSocketUrl(apiBaseUrl, { '3030': '3031' }, explicit);
}

/** Maps Client REST `:3000` (and standalone Router hostUrl on `:3030`) to Socket.IO `:3001`. */
export function deriveClientSocketUrl(
  apiBaseUrl: string,
  explicit?: string | null
): string {
  return deriveSocketUrl(
    apiBaseUrl,
    { '3000': '3001', '3030': '3001' },
    explicit
  );
}

export function deriveSocketUrl(
  apiBaseUrl: string,
  restToSocketPort: Record<string, string>,
  explicit?: string | null
): string {
  if (explicit && explicit.trim() !== '') {
    return trimTrailingSlash(explicit.trim());
  }

  const url = new URL(apiBaseUrl);
  const mapped = restToSocketPort[url.port];
  if (mapped) {
    url.port = mapped;
  }
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return trimTrailingSlash(url.toString());
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
