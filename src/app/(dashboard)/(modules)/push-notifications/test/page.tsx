import { redirect } from 'next/navigation';

export default async function PushTestPage(props: {
  searchParams: Promise<{
    token?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams({ tab: 'push' });

  if (searchParams.token) {
    params.set('token', searchParams.token);
  }

  redirect(`/communications/test?${params.toString()}`);
}
