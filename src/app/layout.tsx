import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/helpers/Toast/toaster';
import { ProviderInjector } from '@/components/providers/ProviderInjector';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Conduit Platform | Admin Panel',
  description: 'Your go-to place for managing your Conduit deployment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} style={{ overflow: 'hidden' }}>
        <main className={'h-dvh'}>
          <ProviderInjector>{children}</ProviderInjector>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
