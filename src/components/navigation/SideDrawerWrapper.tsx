import React, { FC } from 'react';
import { Box, DialogTitle, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface PropsDrawer {
  open: boolean;
  width?: string | number;
  title?: string;
  maxWidth?: string | number;
  minWidth?: string | number;
  closeDrawer: (close: boolean) => void;
}
const DrawerWrapper: FC<PropsDrawer> = ({
  width = 'auto',
  minWidth = 400,
  maxWidth = 1400,
  open,
  closeDrawer,
  title,
  children,
}) => {
  const toggleDrawer = (close: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    closeDrawer(close);
  };

  return (
    <Drawer
      open={open}
      anchor={'right'}
      onClose={toggleDrawer(false)}
      sx={{
        '& .MuiDrawer-paper': {
          minWidth: minWidth,
          maxWidth: maxWidth,
          width: width,
          padding: 3,
        },
      }}
      transitionDuration={{ appear: 300, enter: 300, exit: 200 }}>
      <Box
        sx={{
          zIndex: 10,
          position: 'absolute',
          right: 0,
          top: 0,
          padding: 0.5,
          paddingBottom: 0,
        }}>
        <IconButton onClick={toggleDrawer(false)} sx={{ p: 1 }} size="large">
          <CloseIcon />
        </IconButton>
      </Box>
      {title && <DialogTitle sx={{ textAlign: 'center' }}> {title} </DialogTitle>}
      {children}
    </Drawer>
  );
};

export default DrawerWrapper;
