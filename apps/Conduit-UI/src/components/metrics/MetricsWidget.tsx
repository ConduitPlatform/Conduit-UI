import React, { FC, ReactNode } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';

interface Props {
  metric: ReactNode;
  title: string;
  small?: boolean;
  icon?: ReactNode;
}

const MetricsWidget: FC<Props> = ({ metric, title, small, icon }) => {
  const theme = useTheme();

  const fontSizes = {
    fontSize: '1rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.8rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.6rem',
    },
  };

  const fontSizesSmall = {
    fontSize: '1rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.7rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.5rem',
    },
  };

  return (
    <>
      {!small ? (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
            gap: 3,
            borderRadius: '24px',
          }}>
          <Box display="flex">
            {metric} {icon}
          </Box>
          <Typography sx={{ fontSize: fontSizes }}>{title}</Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1,
            px: 2,
            gap: 0.7,
            borderRadius: '16px',
          }}>
          <Box display="flex">
            {metric} {icon}
          </Box>
          <Typography sx={{ fontSize: fontSizesSmall }}>{title}</Typography>
        </Paper>
      )}
    </>
  );
};

export default MetricsWidget;
