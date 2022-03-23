import React from 'react';
import { Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  root: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const Database: React.FC = () => {
  const classes = useStyles();

  return <Box className={classes.root}>Coming not so soon</Box>;
};

export default Database;
