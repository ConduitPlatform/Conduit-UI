import { Skeleton, Typography, useTheme } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { asyncGetCounter } from '../../redux/slices/metricsSlice';
import { useAppSelector } from '../../redux/store';
import LottieForWidget from './LottieForWidget';
import MetricsWidget from './MetricsWidget';
import { getLottieByTitle } from './getLottieByTitle';

interface Props {
  expression: string;
  title: string;
  small?: boolean;
}

const MetricCount: FC<Props> = ({ expression, title, small }) => {
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

  const latencyFontSizeSmall = {
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.3rem',
    },
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.9rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.7rem',
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
      small={small}
      icon={<LottieForWidget small={small} lottieFile={getLottieByTitle(title)} />}
      metric={
        <Typography
          color="primary"
          variant="h4"
          sx={{ fontSize: small ? latencyFontSizeSmall : latencyFontSize }}>
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
