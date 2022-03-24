import React, { FC } from 'react';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Box, DialogTitle, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    close: {
      zIndex: 10,
      position: 'absolute',
      right: 0,
      top: 0,
      padding: theme.spacing(0.5),
      paddingBottom: theme.spacing(0),
    },
    paper: {
      minWidth: (props: any) => props.minWidth,
      maxWidth: (props: any) => props.maxWidth,
      width: (props: any) => props.width,
      padding: theme.spacing(3),
    },
  })
);

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
  const classes = useStyles({ minWidth: minWidth, maxWidth: maxWidth, width: width });

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
      classes={{
        paper: classes.paper,
      }}
      transitionDuration={{ appear: 300, enter: 300, exit: 200 }}>
      <Box className={classes.close}>
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
