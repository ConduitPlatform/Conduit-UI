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
  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const sm = useMediaQuery(theme.breakpoints.only('sm'));
  const md = useMediaQuery(theme.breakpoints.only('md'));
  const lg = useMediaQuery(theme.breakpoints.only('lg'));
  const health = useAppSelector((state) => state?.metricsSlice?.data?.moduleHealth?.[module]);
  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.moduleHealthLoading?.[module]
  );

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: heartbeat,
    rendererSettings: {
      preserveAspectRatio: 'xMid slice',
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

  const healthLottieSizing = () => {
    if (small) {
      if (xs || sm) {
        return 16;
      } else if (md) {
        return 19;
      } else if (lg) {
        return 26;
      } else {
        return 26;
      }
    } else if (xs || sm) {
      return 24;
    } else if (md) {
      return 26;
    } else if (lg) {
      return 30;
    } else {
      return 42;
    }
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
      icon={
        !loading && (
          <Lottie
            options={defaultOptions}
            height={healthLottieSizing()}
            width={healthLottieSizing()}
            style={{ padding: 0 }}
          />
        )
      }
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
        </Box>
      }
      title="Health"
    />
  );
};

export default ModuleHealth;
