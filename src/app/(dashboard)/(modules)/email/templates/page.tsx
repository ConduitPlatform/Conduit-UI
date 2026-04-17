import { getExternalTemplates, getTemplates } from '@/lib/api/email';
import { TemplatesDashboard } from '@/components/email/templates/dashboard';

type EmailTemplatesParams = {
  searchParams: Promise<{
    pageIndex?: number;
    sort?: string;
    search?: string;
    externalPageIndex?: number;
    sortByName?: boolean;
  }>;
};

export default async function EmailTemplates(
  props: Readonly<EmailTemplatesParams>
) {
  const searchParams = await props.searchParams;

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
