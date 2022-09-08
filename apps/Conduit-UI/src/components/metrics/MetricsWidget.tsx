import React, { FC } from 'react';
import { Paper, Typography } from '@mui/material';

interface Props {
  value: string;
  title: string;
}

const MetricsWidget: FC<Props> = ({ value, title }) => {
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
      <Typography color="primary" variant="h4">
        {value}
      </Typography>
      <Typography>{title}</Typography>
    </Paper>
  );
};

export default MetricsWidget;
