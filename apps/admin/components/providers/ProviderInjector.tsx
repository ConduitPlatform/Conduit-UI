import { LoginProvider } from '@/components/providers/LoginProvider';
import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';

export const ProviderInjector = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <LoginProvider>
        {children}
      </LoginProvider>
    </ThemeProvider>);
};
