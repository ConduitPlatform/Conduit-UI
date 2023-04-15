import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { IFunctionsConfig } from '../models/FunctionsModels';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { FormProvider, useForm } from 'react-hook-form';
import { FormInputSwitch } from '../../../components/common/FormComponents/FormInputSwitch';
import { ConfigContainer, ConfigSaveSection } from '@conduitplatform/ui-components';
import { asyncUpdateFunctionsConfig } from '../store/functionsSlice';

const FunctionsConfig: React.FC = () => {
  const dispatch = useAppDispatch();

  const [edit, setEdit] = useState<boolean>(false);

  const { config } = useAppSelector((state) => state.functionsSlice.data);

  const methods = useForm<IFunctionsConfig>({
    defaultValues: useMemo(() => {
      return config;
    }, [config]),
  });

  const { reset, control, register } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const handleCancel = () => {
    setEdit(false);
    reset();
  };

  const onSubmit = useCallback(
    (data: IFunctionsConfig) => {
      setEdit(false);
      dispatch(asyncUpdateFunctionsConfig(data));
    },
    [dispatch]
  );
  return (
    <ConfigContainer>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container>
            <Box
              width={'100%'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              mb={1}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant={'h6'}>Activate Functions Module</Typography>
              </Box>
              <FormInputSwitch {...register('active', { disabled: !edit })} />
            </Box>
            <ConfigSaveSection edit={edit} setEdit={setEdit} handleCancel={handleCancel} />
          </Grid>
        </form>
      </FormProvider>
    </ConfigContainer>
  );
};

export default FunctionsConfig;
