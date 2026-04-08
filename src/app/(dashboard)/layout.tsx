import { AppSidebar } from '@/components/navigation/appSidebar';
import { CommandPalette } from '@/components/navigation/commandPalette';
import { ShortcutSheet } from '@/components/navigation/ShortcutSheet';
import { ModuleAvailabilityProvider } from '@/contexts/ModuleAvailabilityContext';
import { ModuleGuard } from '@/components/module-guard/ModuleGuard';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ModuleAvailabilityProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="relative flex flex-col flex-1 min-h-svh bg-background md:ml-[52px]">
          <ModuleGuard>{children}</ModuleGuard>
        </main>
        <CommandPalette />
        <ShortcutSheet />
      </div>
    </ModuleAvailabilityProvider>
  );
}
