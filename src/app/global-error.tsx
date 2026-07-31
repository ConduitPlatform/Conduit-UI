'use client';

import { Inter } from 'next/font/google';
import { AlertTriangle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

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
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        <div className="grid h-dvh grid-cols lg:grid-cols-2">
          <div className="hidden h-full items-center justify-center bg-gray-900 lg:flex dark:bg-gray-800">
            <div className="flex flex-col items-center gap-4 text-white">
              <AlertTriangle className="h-16 w-16 opacity-40" />
              <p className="text-lg font-medium opacity-60">
                Critical Application Error
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Something went wrong
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {error.message ||
                    'A critical error occurred. Please try reloading the page.'}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={reset}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
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
