import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleHealth } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Rate from '../../assets/svgs/rate.svg';
import Image from 'next/image';
import MetricsWidget from './MetricsWidget';
import { ScaleLoader } from 'react-spinners';

interface Props {
  module: ModulesTypes;
}

const ModuleHealth: FC<Props> = ({ module }) => {
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

  useEffect(() => {
    dispatch(
      asyncGetModuleHealth({
        module,
      })
    );
  }, [dispatch, module]);

  return (
    <MetricsWidget
      metric={
        <Box display="flex" gap={1} alignItems="center">
          {loading && (
            <Typography color="primary" variant="h4" sx={{ fontSize: healthFontSize }}>
              <Skeleton variant="rectangular" width="90px" sx={{ borderRadius: 12 }} />
            </Typography>
          )}
          {health && !loading && (
            <Typography color="primary" variant="h4" sx={{ fontSize: healthFontSize }}>
              Good
            </Typography>
          )}
          {!health && !loading && (
            <Typography color="error" variant="h4" sx={{ fontSize: healthFontSize }}>
              Critical
            </Typography>
          )}
          <Image src={Rate} alt="Heart rate" height={19} width={19} />
        </Box>
      }
      title="Health"
    />
  );
};

export default ModuleHealth;
