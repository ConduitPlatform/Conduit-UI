import React, { ReactElement } from 'react';
import FunctionsLayout from '../../features/functions/functionsLayout';
import dynamic from 'next/dynamic';
import LoaderComponent from '../../components/common/LoaderComponent';

const TestFunctions = dynamic(
  () => import('../../features/functions/components/TestFunctionForm'),
  {
    loading: () => <LoaderComponent />,
  }
);

const Test = () => {
  return <TestFunctions />;
};

Test.getLayout = function getLayout(page: ReactElement) {
  return <FunctionsLayout>{page}</FunctionsLayout>;
};

export default Test;
