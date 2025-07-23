import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/appSidebar';
import { ModuleAvailabilityProvider } from '@/contexts/ModuleAvailabilityContext';
import { ModuleGuard } from '@/components/module-guard/ModuleGuard';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ModuleAvailabilityProvider>
      <SidebarProvider>
        <AppSidebar />
        <main
          className="relative flex flex-col flex-1 min-h-svh bg-background',
          'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]"
        >
          <ModuleGuard>{children}</ModuleGuard>
        </main>
      </SidebarProvider>
    </ModuleAvailabilityProvider>
  );
}
