import React, { FC, useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Button, Grid, Paper, Typography } from '@mui/material';
import { Product, reccuringEnum } from '../../models/PaymentsModels';
import { FormInputText } from '../../../../components/common/FormComponents/FormInputText';
import { FormInputSelect } from '../../../../components/common/FormComponents/FormInputSelect';
import { FormInputSwitch } from '../../../../components/common/FormComponents/FormInputSwitch';

interface Props {
  preloadedValues: Product;
  handleSubmitData: (data: Product) => void;
  handleClose: () => void;
}

interface IProductForm {
  name: string;
  value: number;
  vat: number;
  productDescription: string;
  trialDays: number;
  currency: string;
  isSubscription: boolean;
  recurring: reccuringEnum;
  recurringCount: number;
}

const ProductForm: FC<Props> = ({ preloadedValues, handleSubmitData, handleClose }) => {
  const methods = useForm<IProductForm>({ defaultValues: preloadedValues });

  const { handleSubmit, reset, control, setValue, register } = methods;

  const isSubscription = useWatch({
    control,
    name: 'isSubscription',
  });

  useEffect(() => {
    setValue('currency', preloadedValues.currency.toLowerCase());
    setValue('recurring', reccuringEnum[preloadedValues.recurring]);
  }, [setValue, preloadedValues]);

  const onSubmit = (data: Product) => {
    handleSubmitData(data);
  };

  const onCancel = () => {
    reset();
    handleClose();
  };

  const currencies = [
    {
      value: '',
      label: 'None',
    },
    {
      value: 'usd',
      label: '$',
    },
    {
      value: 'eur',
      label: '€',
    },
    {
      value: 'btc',
      label: '฿',
    },
    {
      value: 'jpy',
      label: '¥',
    },
  ];

  const recuringOptions = [
    { value: reccuringEnum.day, label: 'Daily' },
    {
      value: reccuringEnum.week,
      label: 'Weekly',
    },
    {
      value: reccuringEnum.month,
      label: 'Monthly',
    },
    {
      value: reccuringEnum.year,
      label: 'Yearly',
    },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <FormInputText
              {...register('name', { required: 'Product name is required' })}
              label="Name"
            />
          </Grid>
          <Grid item sm={12}>
            <FormInputText {...register('productDescription')} label="Product description" />
          </Grid>
          <Grid item sm={6}>
            <FormInputText
              {...register('value', {
                required: 'Value is required',
                pattern: {
                  value: /^(?!-)\d+$/,
                  message: 'Negative number not allowed',
                },
              })}
              label="Price (in cents, excl. VAT)"
              typeOfInput="number"
            />
          </Grid>
          <Grid item sm={6}>
            <FormInputText
              {...register('vat', {
                required: 'VAT is required',
                pattern: {
                  value: /^(?!-)\d+(\.\d+)?$/,
                  message: 'Negative number not allowed',
                },
              })}
              label="VAT %"
              typeOfInput="number"
            />
          </Grid>
          <Grid item sm={6}>
            <FormInputSelect {...register('currency')} options={currencies} label="Currency" />
          </Grid>
          <Paper elevation={0} sx={{ p: 2, marginTop: 2, color: 'text.primary', width: '100%' }}>
            <Grid item container sm={12}>
              <Grid item sm={11}>
                <Typography>Is subscription:</Typography>
              </Grid>
              <Grid item sm={1}>
                <FormInputSwitch {...register('isSubscription')} />
              </Grid>
            </Grid>
            {isSubscription && (
              <>
                <Grid item sm={12} sx={{ marginTop: 2, color: 'text.primary', width: '100%' }}>
                  <FormInputSelect
                    {...register('recurring')}
                    options={recuringOptions}
                    label="Recurring"
                  />
                </Grid>
                <Grid item sm={12} sx={{ marginTop: '10px' }}>
                  <FormInputText
                    {...register('recurringCount', {
                      pattern: {
                        value: /^(?!-)\d+$/,
                        message: 'Negative number not allowed',
                      },
                    })}
                    label="Recurring count"
                    typeOfInput="number"
                  />
                </Grid>
                <Grid item sm={12} sx={{ marginTop: '10px' }}>
                  <FormInputText
                    {...register('trialDays', {
                      pattern: {
                        value: /^(?!-)\d+$/,
                        message: 'Negative number not allowed',
                      },
                    })}
                    label="Days of Trial period"
                    typeOfInput="number"
                  />
                </Grid>
              </>
            )}
          </Paper>
          <Grid container item>
            <Grid item sx={{ mr: 2 }}>
              <Button variant="outlined" onClick={() => onCancel()}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default ProductForm;
