import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import FormsLayout from '../../features/forms/formsLayout';
import LoaderComponent from '../../components/common/LoaderComponent';

const FormsView = dynamic(() => import('../../features/forms/FormsView'), {
  loading: () => <LoaderComponent />,
});

const Create = () => {
  return <FormsView />;
};

Create.getLayout = function getLayout(page: ReactElement) {
  return <FormsLayout>{page}</FormsLayout>;
};

export default Create;
