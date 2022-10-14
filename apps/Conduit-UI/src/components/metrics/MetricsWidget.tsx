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
      fontSize: '0.7rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.57rem',
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
            gap: 2.5,
            borderRadius: '24px',
          }}>
          <Box display="flex" justifyContent="space-between">
            <Box>{metric}</Box>
            <Box display="flex" justifyContent="flex-end">
              {icon}
            </Box>
          </Box>
          <Typography sx={{ fontSize: fontSizes }} noWrap={true}>
            {title}
          </Typography>
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
          <Box display="flex" justifyContent="space-between">
            <Box>{metric}</Box>
            <Box display="flex" justifyContent="flex-end">
              {icon}
            </Box>
          </Box>
          <Typography sx={{ fontSize: fontSizesSmall }} noWrap={true}>
            {title}
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default MetricsWidget;
