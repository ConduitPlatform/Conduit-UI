import React, { FC, useEffect } from 'react';
import { Skeleton, Typography, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleLatency } from '../../redux/slices/metricsSlice';
import latencyLottie from '../../assets/lotties/latency.json';
import MetricsWidget from './MetricsWidget';
import LottieForWidget from './LottieForWidget';

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

  return (
    <MetricsWidget
      icon={!loading && <LottieForWidget small={small} lottieFile={latencyLottie} />}
      small={small}
      metric={
        <Typography
          color="primary"
          variant="h4"
          sx={{ fontSize: small ? latencyFontSizeSmall : latencyFontSize }}>
          {loading ? (
            <Skeleton variant="rectangular" width="90px" sx={{ borderRadius: 12 }} />
          ) : (
            `${latency?.toFixed(1)}ms`
          )}
        </Typography>
      }
      title="Latency"
    />
  );
};

export default RequestsLatency;
