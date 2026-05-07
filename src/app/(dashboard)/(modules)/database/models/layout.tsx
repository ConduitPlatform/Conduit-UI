type LayoutProps = {
  children: React.ReactNode;
};

export default function ModelsLayout({ children }: Readonly<LayoutProps>) {
  return <div className="flex flex-col h-full w-full">{children}</div>;
}
