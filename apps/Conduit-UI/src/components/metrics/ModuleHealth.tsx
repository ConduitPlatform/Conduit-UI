import { Box, Paper, Typography } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleHealth } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Rate from '../../assets/svgs/rate.svg';
import Image from 'next/image';

interface Props {
  module: ModulesTypes;
}

const ModuleHealth: FC<Props> = ({ module }) => {
  const dispatch = useAppDispatch();
  const health = useAppSelector((state) => state?.metricsSlice?.moduleHealth?.[module]);

  useEffect(() => {
    dispatch(
      asyncGetModuleHealth({
        module,
      })
    );
  }, [dispatch, module]);

  //TODO logic for displaying module health

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
      <Box display="flex" gap={1} alignItems="center">
        {health ? (
          <Typography color="primary" variant="h4">
            Good
          </Typography>
        ) : (
          <Typography color="error" variant="h4">
            Critical
          </Typography>
        )}
        <Image src={Rate} alt="Heart rate" />
      </Box>
      <Typography>Health</Typography>
    </Paper>
  );
};

export default ModuleHealth;
