import { Box, Typography } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { ModulesTypes } from '../../models/logs/LogsModels';
import { asyncGetModuleHealth } from '../../redux/slices/metricsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

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
    <Box
      display="flex"
      flexDirection="column"
      maxHeight="129px"
      gap={2}
      alignItems="center"
      justifyContent="center">
      <Typography>
        Module{' '}
        {health ? (
          <Typography color="primary" sx={{ display: 'inline' }}>
            is healthy
          </Typography>
        ) : (
          <Typography color="error" sx={{ display: 'inline' }}>
            health is critical
          </Typography>
        )}
      </Typography>
    </Box>
  );
};

export default ModuleHealth;
