import SidebarList from '@/components/navigation/sidebarList';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={'flex'}>
      <SidebarList />
      <div className="relative flex-grow h-screen">{children}</div>
    </div>
  );
}
