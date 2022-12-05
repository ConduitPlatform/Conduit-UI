import React from 'react';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../../components/common/LoaderComponent';

const SchemaEditor = dynamic(
  () => import('../../../features/database/components/schemas/SchemaEditor'),
  {
    loading: () => <LoaderComponent />,
  }
);

const EditSchema = () => {
  return <SchemaEditor />;
};

export default EditSchema;
