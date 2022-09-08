import React, { FC, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleLatency } from '../../redux/slices/metricsSlice';
import MetricsWidget from './MetricsWidget';

interface Props {
  module: ModulesTypes;
}

const RequestsLatency: FC<Props> = ({ module }) => {
  const dispatch = useAppDispatch();
  const latency: number = useAppSelector((state) => state?.metricsSlice?.moduleLatency?.[module]);

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
          {latency?.toFixed(1)}ms
        </Typography>
      }
      title="Latency"
    />
  );
};

export default RequestsLatency;
