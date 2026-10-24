import { LoginProvider } from '@/components/providers/LoginProvider';
import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { AlertProvider } from '@/components/providers/AlertProvider';
import { UserPickerProvider } from '@/components/helpers/UserPicker/UserPicker';

export const ProviderInjector = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LoginProvider>
        <AlertProvider>
          <UserPickerProvider>{children}</UserPickerProvider>
        </AlertProvider>
      </LoginProvider>
    </ThemeProvider>
  );
};
