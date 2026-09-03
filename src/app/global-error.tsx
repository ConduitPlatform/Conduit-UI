'use client';

import { Inter } from 'next/font/google';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = Exclude<ThemePreference, 'system'>;

const themeBootstrapScript = `
  (() => {
    const root = document.documentElement;
    let preference = 'system';

    try {
      const savedPreference = window.localStorage.getItem('theme');
      if (
        savedPreference === 'light' ||
        savedPreference === 'dark' ||
        savedPreference === 'system'
      ) {
        preference = savedPreference;
      }
    } catch {}

    const theme =
      preference === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : preference;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  })();
`;

const readThemePreference = (): ThemePreference => {
  try {
    const preference = window.localStorage.getItem('theme');
    return preference === 'light' || preference === 'dark'
      ? preference
      : 'system';
  } catch {
    return 'system';
  }
};

const handleGoHome = () => {
  window.location.assign('/');
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
    let preference = readThemePreference();

    const applyTheme = () => {
      const theme =
        preference === 'system'
          ? systemTheme.matches
            ? 'light'
            : 'dark'
          : preference;

      document.documentElement.style.colorScheme = theme;
      setResolvedTheme(theme);
    };

    const handleSystemThemeChange = () => {
      if (preference === 'system') applyTheme();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'theme') return;
      preference = readThemePreference();
      applyTheme();
    };

    applyTheme();
    systemTheme.addEventListener('change', handleSystemThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      systemTheme.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <html
      lang="en"
      className={`${resolvedTheme} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <div className="grid h-dvh grid-cols lg:grid-cols-2">
          <div className="hidden h-full items-center justify-center border-r border-border bg-surface-1 lg:flex">
            <div className="flex flex-col items-center gap-4 text-foreground">
              <AlertTriangle className="h-16 w-16 text-status-critical opacity-60" />
              <p className="text-lg font-medium text-foreground-muted">
                Critical Application Error
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-callout-danger bg-callout-danger-muted">
                <AlertTriangle className="h-7 w-7 text-callout-danger-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Something went wrong
                </h1>
                <p className="text-sm text-foreground-muted">
                  {error.message ||
                    'A critical error occurred. Please try reloading the page.'}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={reset}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border-strong bg-surface-1 px-6 text-sm font-medium text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
