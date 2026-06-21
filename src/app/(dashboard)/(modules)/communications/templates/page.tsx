import { getCommunicationTemplates } from '@/lib/api/communications/templates';
import { CommunicationTemplatesDashboard } from '@/components/communications/templates/dashboard';

type CommunicationTemplatesParams = {
  searchParams: Promise<{
    pageIndex?: number;
    sort?: string;
    search?: string;
  }>;
};

export default async function CommunicationTemplatesPage(
  props: Readonly<CommunicationTemplatesParams>
) {
  const searchParams = await props.searchParams;

  const templates = await getCommunicationTemplates({
    skip: searchParams.pageIndex ? searchParams.pageIndex * 10 : 0,
    limit: 10,
    sort: searchParams.sort,
    search: searchParams.search,
  });

  return <CommunicationTemplatesDashboard data={templates} />;
}
