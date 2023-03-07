import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

interface Props {
  listActions?: ReactNode;
  list?: ReactNode;
  buttons?: ReactNode;
  infoComponent?: ReactNode;
}

const InfiniteScrollLayout: React.FC<Props> = ({ listActions, list, buttons, infoComponent }) => {
  return (
    <Box
      height={'77vh'}
      sx={{
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
      <Box
        sx={{ minHeight: '50vh', width: '400px', display: 'flex', p: 1, flexDirection: 'column' }}>
        {listActions}
        <Box width={'100%'} height={'100%'} sx={{ marginTop: 1 }}>
          {list}
        </Box>
        <Box width={'100%'} sx={{ marginTop: 1 }}>
          {buttons}
        </Box>
      </Box>
      <Box sx={{ overflow: 'auto' }} width={'100%'}>
        {infoComponent}
      </Box>
    </Box>
  );
};

export default InfiniteScrollLayout;
