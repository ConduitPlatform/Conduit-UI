export function deriveAdminSocketUrl(
  apiBaseUrl: string,
  explicit?: string | null
): string {
  if (explicit && explicit.trim() !== '') {
    return trimTrailingSlash(explicit.trim());
  }

  const url = new URL(apiBaseUrl);
  if (url.port === '3030') {
    url.port = '3031';
  }
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return trimTrailingSlash(url.toString());
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
