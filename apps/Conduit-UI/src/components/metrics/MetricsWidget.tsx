import React, { FC, ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';

interface Props {
  metric: ReactNode;
  title: string;
}

const MetricsWidget: FC<Props> = ({ metric, title }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 3,
        borderRadius: '24px',
      }}>
      {metric}
      <Typography>{title}</Typography>
    </Paper>
  );
};

export default MetricsWidget;
