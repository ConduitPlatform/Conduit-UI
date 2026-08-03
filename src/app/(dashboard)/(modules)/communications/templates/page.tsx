import { CommunicationTemplatesDashboard } from '@/components/communications/templates/dashboard';
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-header';

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

      <CommunicationTemplatesDashboard emailTemplateId={emailTemplateId} />
    </div>
  );
}
