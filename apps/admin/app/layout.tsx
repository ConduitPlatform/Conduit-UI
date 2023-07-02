import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/Toast/toaster';
import { LoginProvider } from '@/components/LoginProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Conduit Platform | Admin Panel',
  description: 'Your go-to place for managing your Conduit deployment',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
    <body className={inter.className}>
    <main className={'h-[100vh] w-[100vw]'}>
      <LoginProvider>{children}</LoginProvider></main>
    <Toaster />

    </body>
    </html>
  );
}
