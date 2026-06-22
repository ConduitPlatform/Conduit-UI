import { redirect } from 'next/navigation';

type EmailTemplateRedirectProps = {
  params: Promise<{
    _id: string;
  }>;
  searchParams: Promise<{
    'editor-open'?: string;
  }>;
};

export default async function EmailTemplateRedirectPage(
  props: EmailTemplateRedirectProps
) {
  const { _id } = await props.params;
  const searchParams = await props.searchParams;
  const query =
    searchParams['editor-open'] === 'true' ? '?editor-open=true' : '';
  redirect(`/communications/templates/email/${_id}${query}`);
}
