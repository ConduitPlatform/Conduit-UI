import { getCommunicationTemplates } from '@/lib/api/communications/templates';
import { getExternalTemplates, getTemplates } from '@/lib/api/email';
import { CommunicationTemplatesDashboard } from '@/components/communications/templates/dashboard';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';

const TEMPLATE_LIST_LIMIT = 500;

type CommunicationTemplatesParams = {
  searchParams: Promise<{
    pageIndex?: number;
    sort?: string;
    search?: string;
    email?: string;
    legacy?: string;
  }>;
};

export default async function CommunicationTemplatesPage(
  props: Readonly<CommunicationTemplatesParams>
) {
  const searchParams = await props.searchParams;

  const fetchArgs = {
    skip: searchParams.pageIndex ? searchParams.pageIndex * 10 : 0,
    limit: TEMPLATE_LIST_LIMIT,
    sort: searchParams.sort,
    search: searchParams.search,
  };

  const [communicationTemplates, emailTemplates, externalTemplates] =
    await Promise.all([
      getCommunicationTemplates(fetchArgs),
      getTemplates(fetchArgs),
      getExternalTemplates({
        limit: TEMPLATE_LIST_LIMIT,
        sortByName: true,
      }).catch(() => null),
    ]);

  const emailTemplateId = searchParams.email ?? searchParams.legacy;

  return (
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Templates</PageTitle>
          <PageDescription>
            Manage multi-channel message templates across email, SMS, and push.
          </PageDescription>
        </div>
      </PageHeader>

      <CommunicationTemplatesDashboard
        communicationTemplates={communicationTemplates}
        emailTemplates={emailTemplates}
        externalTemplates={externalTemplates}
        emailTemplateId={emailTemplateId}
      />
    </div>
  );
}
