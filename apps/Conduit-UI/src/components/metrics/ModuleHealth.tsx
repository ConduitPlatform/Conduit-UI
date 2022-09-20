import { Box, Typography, useTheme } from '@mui/material';
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
            <ScaleLoader
              speedMultiplier={3}
              color={theme.palette.primary.main}
              loading={loading}
              height={28}
              cssOverride={{
                maxHeight: 28,
                overflow: 'hidden',
              }}
            />
          )}
          {health && !loading && (
            <Typography color="primary" variant="h4">
              Good
            </Typography>
          )}
          {!health && !loading && (
            <Typography color="error" variant="h4">
              Critical
            </Typography>
          )}
          <Image src={Rate} alt="Heart rate" />
        </Box>
      }
      title="Health"
    />
  );
};

export default ModuleHealth;
