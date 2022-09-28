import React, { FC, ReactNode } from 'react';
import { Box, Chip, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';

interface Props {
  metric: ReactNode;
  title: string;
  small?: boolean;
}

const MetricsWidget: FC<Props> = ({ metric, title, small }) => {
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
          {metric}
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
          {metric}
          <Typography sx={{ fontSize: fontSizesSmall }}>{title}</Typography>
        </Paper>
      )}
    </>
  );
};

export default MetricsWidget;
