import { FileSystemActionsProvider } from '@/components/storage/FileSystemActionsProvider';
import { getModules } from '@/lib/api/modules';

type LayoutProps = {
  children: React.ReactNode;
  files: React.ReactNode;
  folders: React.ReactNode;
};

export default async function Layout({
  children,
  files,
  folders,
}: LayoutProps) {
  const modules = await getModules();
  const storageModuleAvailable = !!modules.find(
    m => m.moduleName === 'storage' && m.serving
  );
  if (!storageModuleAvailable) return <>Storage module is not serving.</>;
  return (
    <FileSystemActionsProvider>
      <div className="space-y-5">
        <div>{children}</div>
        <div className="grid grid-flow-row auto-rows-max gap-10">
          {folders}
          {files}
        </div>
      </div>
    </FileSystemActionsProvider>
  );
}
