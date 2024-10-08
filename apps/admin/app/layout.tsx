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
  logsdrawer,
}: {
  children: React.ReactNode;
  logsdrawer: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ overflow: 'hidden' }}>
        <main className={'h-[100vh] min-w-[1080px] overflow-auto'}>
          <ProviderInjector>
            {children}
            {logsdrawer}
          </ProviderInjector>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
