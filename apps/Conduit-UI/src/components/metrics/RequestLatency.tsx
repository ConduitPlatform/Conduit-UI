import React, { FC, useEffect } from 'react';
import { Typography, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleLatency } from '../../redux/slices/metricsSlice';
import latencyLottie from '../../assets/lotties/latency.json';
import MetricsWidget from './MetricsWidget';
import LottieForWidget from './LottieForWidget';
import MetricWidgetSkeleton from './MetricsWidgetSkeleton';

interface Props {
  module: ModulesTypes;
  modulesLength?: number;
  small?: boolean;
}

const RequestsLatency: FC<Props> = ({ module, modulesLength, small }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const latency: number = useAppSelector(
    (state) => state?.metricsSlice?.data?.moduleLatency?.[module]
  );

  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.moduleLatencyLoading?.[module]
  );

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

  useEffect(() => {
    dispatch(
      asyncGetModuleLatency({
        module,
        modulesLength,
      })
    );
  }, [dispatch, module, modulesLength]);

  const extractContent = () => {
    if (loading) {
      return <MetricWidgetSkeleton />;
    } else if (!loading && latency) {
      return `${latency?.toFixed(1)}ms`;
    } else return 'No data';
  };

  return (
    <MetricsWidget
      icon={!loading && <LottieForWidget small={small} lottieFile={latencyLottie} />}
      small={small}
      metric={
        <Typography
          color="primary"
          variant="h4"
          noWrap={true}
          sx={{ fontSize: small ? latencyFontSizeSmall : latencyFontSize }}>
          {extractContent()}
        </Typography>
      }
      title="Latency"
    />
  );
};

export default RequestsLatency;
