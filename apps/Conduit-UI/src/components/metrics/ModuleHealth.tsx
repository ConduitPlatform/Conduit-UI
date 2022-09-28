import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleHealth } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import MetricsWidget from './MetricsWidget';
import Lottie from 'react-lottie';
import heartbeat from '../../assets/lotties/heartbeat.json';

interface Props {
  module: ModulesTypes;
  small?: boolean;
}

const ModuleHealth: FC<Props> = ({ module, small }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const smallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const health = useAppSelector((state) => state?.metricsSlice?.data?.moduleHealth?.[module]);
  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.moduleHealthLoading?.[module]
  );

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: heartbeat,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

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
      metric={
        <Box display="flex" gap={1} alignItems="center">
          {loading && (
            <Typography
              color="primary"
              variant="h4"
              sx={{ fontSize: small ? healthFontSizeSmall : healthFontSize }}>
              <Skeleton variant="rectangular" width="90px" sx={{ borderRadius: 12 }} />
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
          <Lottie options={defaultOptions} height={24} width={24} />
        </Box>
      }
      title="Health"
    />
  );
};

export default ModuleHealth;
