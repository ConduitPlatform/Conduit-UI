import { getFunction } from '@/lib/api/functions';

export default async function FunctionsList({
  params,
}: {
  params: {
    id: string;
  };
}) {
  let data;
  if (params.id === 'new') {
  } else {
    data = getFunction(params.id);
  }

  return <></>;
}
