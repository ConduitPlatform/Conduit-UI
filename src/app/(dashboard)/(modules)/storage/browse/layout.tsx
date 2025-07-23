import { FileSystemActionsProvider } from '@/components/storage/FileSystemActionsProvider';

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
