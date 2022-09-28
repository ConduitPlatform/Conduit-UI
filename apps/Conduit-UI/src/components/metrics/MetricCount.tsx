import { Skeleton, Typography, useTheme } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { asyncGetCounter } from '../../redux/slices/metricsSlice';
import { useAppSelector } from '../../redux/store';
import MetricsWidget from './MetricsWidget';

interface Props {
  expression: string;
  title: string;
}

const MetricCount: FC<Props> = ({ expression, title }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const latencyFontSize = {
    [theme.breakpoints.down('lg')]: {
      fontSize: '1.2rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '1rem',
    },
  };

  const counter: number = useAppSelector(
    (state) => state?.metricsSlice?.data?.metricCounter?.[expression]
  );

  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.metricCounterLoading?.[expression]
  );

  useEffect(() => {
    dispatch(
      asyncGetCounter({
        expression,
      })
    );
  }, [dispatch, expression]);

  return (
    <MetricsWidget
      metric={
        <Typography color="primary" variant="h4" sx={{ fontSize: latencyFontSize }}>
          {loading ? (
            <Skeleton variant="rectangular" width="90px" sx={{ borderRadius: 12 }} />
          ) : (
            counter
          )}
        </Typography>
      }
      title={title}
    />
  );
};

export default MetricCount;
