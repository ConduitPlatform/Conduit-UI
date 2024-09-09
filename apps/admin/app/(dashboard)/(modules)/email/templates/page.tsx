import { getModules } from '@/lib/api/modules';
import { getTemplates } from '@/lib/api/email';
import { TemplatesDashboard } from '@/components/email/templates/dashboard';

type EmailTemplatesParams = {
  searchParams: {
    pageIndex?: number;
    sort?: string;
    search?: string;
  };
};

export default async function EmailTemplates({
  searchParams,
}: EmailTemplatesParams) {
  const modules = await getModules();
  const emailModuleAvailable = !!modules.find(
    m => m.moduleName === 'email' && m.serving
  );

  if (!emailModuleAvailable) return <>Email module is not serving.</>;

  const templates = await getTemplates({
    skip: searchParams.pageIndex ? searchParams.pageIndex * 10 : 0,
    sort: searchParams.sort,
    search: searchParams.search,
  });
  return <TemplatesDashboard data={templates} />;
}
