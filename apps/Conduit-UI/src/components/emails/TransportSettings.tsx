import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { IEmailConfig } from '../../models/emails/EmailModels';
import { useWatch } from 'react-hook-form';
import { Control } from 'react-hook-form/dist/types';
import { FormInputText } from '../common/FormComponents/FormInputText';

interface Props {
  data: IEmailConfig;
  control: Control<IEmailConfig>;
  disabled: boolean;
}

const TransportSettings: React.FC<Props> = ({ data, control, disabled }) => {
  const transportProvider = useWatch({
    control,
    name: 'transport',
  });

  const handleFields = () => {
    const fields: any = data.transportSettings[transportProvider];
    return (
      <Grid item container xs={4} direction="column">
        {Object.keys(fields).map((field) => {
          if (transportProvider === 'smtp' && field === 'auth') {
            return Object.keys(fields[field]).map((childField) => {
              return (
                <FormInputText
                  name={`transportSettings.smtp.auth.${childField}`}
                  label={childField}
                  textFieldProps={{
                    fullWidth: false,
                    sx: { mb: 1 },
                  }}
                  disabled={disabled}
                  key={childField}
                />
              );
            });
          }
          return (
            <FormInputText
              name={`transportSettings.${transportProvider}.${field}`}
              label={field}
              textFieldProps={{
                fullWidth: false,
                sx: { mb: 1 },
              }}
              disabled={disabled}
              key={field}
            />
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant={'h6'}>Transport settings</Typography>
      </Grid>
      {handleFields()}
    </>
  );
};

export default TransportSettings;
