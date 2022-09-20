import React, { FC, useEffect } from 'react';
import { Typography, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleLatency } from '../../redux/slices/metricsSlice';
import MetricsWidget from './MetricsWidget';
import { ScaleLoader } from 'react-spinners';

interface Props {
  module: ModulesTypes;
}

const RequestsLatency: FC<Props> = ({ module }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const latency: number = useAppSelector(
    (state) => state?.metricsSlice?.data?.moduleLatency?.[module]
  );

  const loading = useAppSelector(
    (state) => state?.metricsSlice?.meta?.moduleLatencyLoading?.[module]
  );

  useEffect(() => {
    dispatch(
      asyncGetModuleLatency({
        module,
      })
    );
  }, [dispatch, module]);

  return (
    <MetricsWidget
      metric={
        <Typography color="primary" variant="h4">
          {loading ? (
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
