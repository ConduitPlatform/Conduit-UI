import { Typography, useTheme } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { asyncGetCounter } from '../../redux/slices/metricsSlice';
import { useAppSelector } from '../../redux/store';
import LottieForWidget from './LottieForWidget';
import MetricsWidget from './MetricsWidget';
import { getLottieByTitle } from './getLottieByTitle';
import MetricWidgetSkeleton from './MetricsWidgetSkeleton';
import { completeExpression } from '../../utils/injectMetricsLabels';

interface Props {
  expression: string;
  labels?: { [key: string]: string | number | boolean };
  title: string;
  small?: boolean;
}

const MetricCount: FC<Props> = ({ expression, title, small, labels }) => {
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
    (state) => state?.metricsSlice?.data?.metricCounter?.[completeExpression(expression, labels)]
  );

  const loading = useAppSelector(
    (state) =>
      state?.metricsSlice?.meta?.metricCounterLoading?.[completeExpression(expression, labels)]
  );

  useEffect(() => {
    dispatch(
      asyncGetCounter({
        expression: completeExpression(expression, labels),
      })
    );
  }, [dispatch, expression, labels]);

  const extractContent = () => {
    if (loading) {
      return <MetricWidgetSkeleton />;
    } else if (!loading && counter) {
      return counter;
    } else {
      return 'No data';
    }
  };

  return (
    <MetricsWidget
      small={small}
      icon={<LottieForWidget small={small} lottieFile={getLottieByTitle(title)} />}
      metric={
        <Typography
          color="primary"
          variant="h4"
          sx={{ fontSize: small ? latencyFontSizeSmall : latencyFontSize }}
          noWrap={true}>
          {extractContent()}
        </Typography>
      }
      title={title}
    />
  );
};

export default MetricCount;
