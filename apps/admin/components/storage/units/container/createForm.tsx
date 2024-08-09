'use client';

import { BaseContainerForm } from '@/components/storage/units/container/baseForm';

export const CreateContainerForm = () => {
  return <BaseContainerForm title={''} action={data => console.log(data)} />;
};
