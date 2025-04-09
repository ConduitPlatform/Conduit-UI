'use client';

import { useEffect, useState } from 'react';
import { getSchemaDocument } from '@/lib/api/database';
import { Skeleton } from '@/components/ui/skeleton';

export const ModelDetails = ({
  id,
  modelName,
}: {
  id: string;
  modelName: string;
}) => {
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    getSchemaDocument(modelName, id)
      .then(res => setModel(res))
      .catch(err => {
        console.log(err);
        if (err.message === 'not_found') setModel('not_found');
      });
  }, []);

  if (model === 'not_found') {
    return <span>Document not found</span>;
  }
  if (!model) {
    return (
      <div className="flex flex-col gap-y-2 mt-5">
        <Skeleton className="w-1/2 h-5 mb-5" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-full h-5" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-2 mt-5 h-full overflow-scroll">
      {Object.keys(model).map(key => (
        <div key={key} className="grid gap-x-2">
          <span className="w-1/4 font-semibold">{key}</span>
          <span>{JSON.stringify(model[key])}</span>
        </div>
      ))}
    </div>
  );
};
