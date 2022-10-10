import React from 'react';
import { Skeleton, useMediaQuery, useTheme } from '@mui/material';

const MetricWidgetSkeleton = () => {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down('md'));

  const skeletonWidth = () => {
    if (sm) {
      return '40px';
    } else return '80px';
  };

  return <Skeleton variant="rectangular" width={skeletonWidth()} sx={{ borderRadius: 12 }} />;
};

export default MetricWidgetSkeleton;
