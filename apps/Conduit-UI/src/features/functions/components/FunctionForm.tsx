import { Button, FormLabel, Grid } from '@mui/material';
import React, { FC } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import FunctionEditor from './FunctionEditor';
import { FormInputText } from '../../../components/common/FormComponents/FormInputText';
import { FunctionType } from '../models/FunctionsModels';

interface Props {
  preloadedValues: FunctionType;
  handleSubmitData: (data: FunctionType) => void;
}

const FunctionForm: FC<Props> = ({ preloadedValues, handleSubmitData }) => {
  const methods = useForm<FunctionType>({ defaultValues: preloadedValues });

  const { handleSubmit, reset, register } = methods;

  const onSubmit = (data: FunctionType) => {
    handleSubmitData({ ...data });
  };

  const onCancel = () => {
    reset();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <FormInputText
              {...register('name', { required: 'Function name is required!' })}
              label="Name"
            />
          </Grid>
          <Grid item sm={12}>
            <FormLabel>Inputs</FormLabel>
            <Controller
              name="inputs"
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <FunctionEditor value={value} setValue={onChange} />
              )}
            />
          </Grid>
          <Grid item sm={12}>
            <FormLabel>Code</FormLabel>
            <Controller
              name="functionCode"
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <FunctionEditor value={value} setValue={onChange} />
              )}
              rules={{ required: 'Function code required' }}
            />
          </Grid>
          <Grid item sm={12}>
            <FormLabel>returns</FormLabel>
            <Controller
              name="returns"
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <FunctionEditor value={value} setValue={onChange} />
              )}
            />
          </Grid>
          <Grid container item>
            <Grid item mr={1}>
              <Button variant="outlined" onClick={() => onCancel()}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" type="submit">
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default FunctionForm;
