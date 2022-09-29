import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import FormsLayout from '../../components/navigation/InnerLayouts/formsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const FormsView = dynamic(() => import('../../components/forms/FormsView'), {
  loading: () => <LoaderComponent />,
});

const Create = () => {
  return <FormsView />;
};

Create.getLayout = function getLayout(page: ReactElement) {
  return <FormsLayout>{page}</FormsLayout>;
};

export default Create;
