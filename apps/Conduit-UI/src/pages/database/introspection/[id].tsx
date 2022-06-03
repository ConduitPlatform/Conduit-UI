import React from 'react';
import SchemaEditor from '../../../components/database/schemas/SchemaEditor';

const IntrospectionSchemaEditor = () => {
  return <SchemaEditor introspection={true} />;
};

export default IntrospectionSchemaEditor;
