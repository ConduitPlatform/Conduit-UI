import React from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const SchemaEditor = dynamic(() => import('../../../components/database/schemas/SchemaEditor'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const IntrospectionSchemaEditor = () => {
  return <SchemaEditor introspection={true} />;
};

export default IntrospectionSchemaEditor;
