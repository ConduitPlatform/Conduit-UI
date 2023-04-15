import React, { ReactElement } from 'react';
import FunctionsLayout from '../../features/functions/functionsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const SavedFunctions = dynamic(() => import('../../features/functions/components/SavedFunctions'), {
  loading: () => <LoaderComponent />,
});

const Functions = () => {
  return <SavedFunctions />;
};

Functions.getLayout = function getLayout(page: ReactElement) {
  return <FunctionsLayout>{page}</FunctionsLayout>;
};

export default Functions;
