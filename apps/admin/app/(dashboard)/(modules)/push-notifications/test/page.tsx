import { getTokenById } from '@/lib/api/notifications';
import { isEmpty } from 'lodash';
import { TestSendForm } from '@/components/notifications/testSend/testSendForm';

export default async function TokensPage({ searchParams }: {
  searchParams: {
    token?: string,
  }
}) {

  // todo implement on backend the ability to send by token
  let token;
  if (!isEmpty(searchParams.token)) {
    token = await getTokenById(searchParams.token ?? '', 'user');
  }


  return <TestSendForm token={token} />;
}
