import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/appSidebar';
import { CommandPalette } from '@/components/navigation/commandPalette';
import { ModuleAvailabilityProvider } from '@/contexts/ModuleAvailabilityContext';
import { ModuleGuard } from '@/components/module-guard/ModuleGuard';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ModuleAvailabilityProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="relative flex flex-col flex-1 min-h-svh bg-background">
          <ModuleGuard>{children}</ModuleGuard>
        </main>
        <CommandPalette />
      </SidebarProvider>
    </ModuleAvailabilityProvider>
  );
}
