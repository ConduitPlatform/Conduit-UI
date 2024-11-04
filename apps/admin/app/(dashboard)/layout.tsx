import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/appSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main
        className="relative flex flex-col flex-1 min-h-svh bg-background',
        'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]"
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
