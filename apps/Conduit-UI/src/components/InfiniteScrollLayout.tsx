import React, { ReactNode } from 'react';
import { Box, Button } from '@mui/material';

interface Props {
  listActions?: ReactNode;
  list?: ReactNode;
  buttonText?: string;
  infoComponent?: any;
  buttonClick?: () => void;
}

const InfiniteScrollLayout: React.FC<Props> = ({
  listActions,
  list,
  buttonText,
  infoComponent,
  buttonClick,
}) => {
  return (
    <Box
      height={'80vh'}
      sx={{
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
      <Box
        sx={{ minHeight: '50vh', width: '400px', display: 'flex', p: 2, flexDirection: 'column' }}>
        {listActions}
        <Box height={'100%'} sx={{ marginTop: 2 }}>
          {list}
        </Box>
        {buttonText ? (
          <Button
            color={'primary'}
            variant={'contained'}
            fullWidth
            sx={{ whiteSpace: 'nowrap', marginTop: 2 }}
            onClick={buttonClick}>
            {buttonText}
          </Button>
        ) : null}
      </Box>
      <Box sx={{ mb: 2, overflow: 'auto' }} width={'100%'}>
        {infoComponent}
      </Box>
    </Box>
  );
};

export default InfiniteScrollLayout;
