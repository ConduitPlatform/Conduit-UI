import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleHealth } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import MetricsWidget from './MetricsWidget';
import heartbeat from '../../assets/lotties/heartbeat.json';
import LottieForWidget from './LottieForWidget';
import MetricWidgetSkeleton from './MetricsWidgetSkeleton';

interface Props {
  module: ModulesTypes;
  small?: boolean;
}

const ModuleHealth: FC<Props> = ({ module, small }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const health = useAppSelector((state) => state?.metricsSlice?.data?.moduleHealth?.[module]);
  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.moduleHealthLoading?.[module]
  );

  const healthFontSize = {
    [theme.breakpoints.down('lg')]: {
      fontSize: '1.2rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '1rem',
    },
  };

  const healthFontSizeSmall = {
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
      asyncGetModuleHealth({
        module,
      })
    );
  }, [dispatch, module]);

  return (
    <MetricsWidget
      small={small}
      icon={!loading && <LottieForWidget small={small} lottieFile={heartbeat} />}
      metric={
        <Box display="flex" gap={1} alignItems="center">
          {loading && (
            <Typography
              color="primary"
              variant="h4"
              sx={{ fontSize: small ? healthFontSizeSmall : healthFontSize }}>
              <MetricWidgetSkeleton />
            </Typography>
          )}
          {health && !loading && (
            <Typography
              color="primary"
              variant="h4"
              sx={{ fontSize: small ? healthFontSizeSmall : healthFontSize }}>
              Good
            </Typography>
          )}
          {!health && !loading && (
            <Typography
              color="error"
              variant="h4"
              sx={{ fontSize: small ? healthFontSizeSmall : healthFontSize }}>
              Critical
            </Typography>
          )}
        </Box>
      }
      title="Health"
    />
  );
};

export default ModuleHealth;
