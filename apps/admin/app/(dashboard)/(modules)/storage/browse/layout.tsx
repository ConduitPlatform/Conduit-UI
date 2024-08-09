import { FileSystemActionsProvider } from '@/components/storage/units/folder/FileSystemActionsProvider';
import { getModules } from '@/lib/api/modules';

export default async function Layout({
  children,
  files,
  folders,
}: {
  children: React.ReactNode;
  files: React.ReactNode;
  folders: React.ReactNode;
}) {
  const modules = await getModules();
  const storageModuleAvailable = !!modules.find(
    m => m.moduleName === 'storage' && m.serving
  );
  if (!storageModuleAvailable) return <>Storage module is not serving.</>;
  return (
    <FileSystemActionsProvider>
      <div className="space-y-5">
        <div>{children}</div>
        <div className="grid grid-rows-3 grid-flow-row gap-10">
          {folders}
          {files}
        </div>
      </div>
    </FileSystemActionsProvider>
  );
}
