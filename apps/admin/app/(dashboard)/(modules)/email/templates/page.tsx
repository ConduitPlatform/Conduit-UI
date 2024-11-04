import { getModules } from '@/lib/api/modules';
import { getExternalTemplates, getTemplates } from '@/lib/api/email';
import { TemplatesDashboard } from '@/components/email/templates/dashboard';

type EmailTemplatesParams = {
  searchParams: {
    pageIndex?: number;
    sort?: string;
    search?: string;
    externalPageIndex?: number;
    sortByName?: boolean;
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
    limit: 10,
    sort: searchParams.sort,
    search: searchParams.search,
  });

  const external = await getExternalTemplates({
    skip: searchParams.externalPageIndex
      ? searchParams.externalPageIndex * 10
      : 0,
    limit: 10,
    sortByName: searchParams.sortByName,
  })
    .then(res => res)
    .catch(() => null);
  return <TemplatesDashboard data={templates} external={external} />;
}
