import React, { ReactElement, useEffect } from 'react';
import DatabaseLayout from '../../components/navigation/InnerLayouts/databaseLayout';
import { Box } from '@mui/material';

const Introspection = () => {
  return <Box>IntroSpection</Box>;
};

Introspection.getLayout = function getLayout(page: ReactElement) {
  return <DatabaseLayout>{page}</DatabaseLayout>;
};

export default Introspection;
