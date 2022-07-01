import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ConfigContainer } from '@conduitplatform/ui-components';
import { asyncPutSecurityConfig } from '../../redux/slices/securitySlice';
import { Switch } from '@mui/material';

const SecurityConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const { config } = useAppSelector((state) => state.securitySlice.data);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { ...config, security: { clientValidation: event.target.checked } };
    if (config.security) {
      dispatch(asyncPutSecurityConfig(newData));
    }
  };

  return (
    <ConfigContainer>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            width={'100%'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <Typography variant={'h6'} color={'#FFFFFF'}>
              Require Client ID/Secret validation
            </Typography>
            <Switch checked={config.security.clientValidation} onChange={onChange} />
          </Box>
        </Grid>
      </Grid>
    </ConfigContainer>
  );
};

export default SecurityConfig;
