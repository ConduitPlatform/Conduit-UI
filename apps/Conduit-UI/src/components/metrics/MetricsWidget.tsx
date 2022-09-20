import React, { FC, ReactNode } from 'react';
import { Paper, Typography, useTheme } from '@mui/material';

interface Props {
  metric: ReactNode;
  title: string;
}

const MetricsWidget: FC<Props> = ({ metric, title }) => {
  const theme = useTheme();

  const fontSizes = {
    fontSize: '1rem',
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.8rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.7rem',
    },
  };
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        height: '100%',
        p: 2,
        gap: 3,
        borderRadius: '24px',
      }}>
      {metric}
      <Typography sx={{ fontSize: fontSizes }}>{title}</Typography>
    </Paper>
  );
};

export default MetricsWidget;
