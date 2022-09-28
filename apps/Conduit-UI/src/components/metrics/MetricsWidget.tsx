import React, { FC, ReactNode } from 'react';
import { Box, Chip, Paper, Typography, useTheme } from '@mui/material';

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
        <Chip
          sx={{ borderRadius: 3 }}
          label={
            <Box py={3} display="flex" gap={3} alignItems="center">
              {metric}
              <Typography sx={{ fontSize: fontSizes }}>{title}</Typography>
            </Box>
          }
        />
      )}
    </>
  );
};

export default MetricsWidget;
