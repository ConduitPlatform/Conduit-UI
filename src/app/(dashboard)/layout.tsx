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
      <div className="flex h-dvh min-h-0 w-full overflow-hidden">
        <AppSidebar />
        <main className="relative flex h-dvh min-h-0 flex-1 flex-col overflow-hidden bg-background md:ml-[52px]">
          <ModuleGuard>{children}</ModuleGuard>
        </main>
        <CommandPalette />
        <ShortcutSheet />
      </div>
    </ModuleAvailabilityProvider>
  );
}
