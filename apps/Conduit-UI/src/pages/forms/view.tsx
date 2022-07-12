import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';
import FormsLayout from '../../components/navigation/InnerLayouts/formsLayout';

const FormsView = dynamic(() => import('../../components/forms/FormsView'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const Create = () => {
  return <FormsView />;
};

Create.getLayout = function getLayout(page: ReactElement) {
  return <FormsLayout>{page}</FormsLayout>;
};

export default Create;
