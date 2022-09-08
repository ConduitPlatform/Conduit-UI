import React, { FC, useEffect } from 'react';
import { Paper, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleLatency } from '../../redux/slices/metricsSlice';

interface Props {
  module: ModulesTypes;
}

const RequestsLatency: FC<Props> = ({ module }) => {
  const dispatch = useAppDispatch();
  const latency = useAppSelector((state) => state?.metricsSlice?.moduleLatency?.[module]);

  useEffect(() => {
    dispatch(
      asyncGetModuleLatency({
        module,
      })
    );
  }, [dispatch, module]);

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 3,
        borderRadius: '24px',
      }}>
      <Typography color="primary" variant="h4">
        {latency}ms
      </Typography>
      <Typography>Latency</Typography>
    </Paper>
  );
};

export default RequestsLatency;
