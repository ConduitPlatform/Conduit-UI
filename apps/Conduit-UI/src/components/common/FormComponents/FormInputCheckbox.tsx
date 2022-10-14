import React, { forwardRef } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import { FormControlLabel } from '@mui/material';
import { ConduitCheckbox } from '@conduitplatform/ui-components';

interface FormCheckboxProps {
  name: string;
  label: string;
  disabled?: boolean;
  rules?: ControllerProps['rules'];
}

export const FormInputCheckBox = forwardRef((props: FormCheckboxProps) => {
  const { name, disabled, label, rules } = props;
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormControlLabel
          control={
            <ConduitCheckbox {...field} color="primary" checked={field.value} disabled={disabled} />
          }
          label={label}
        />
      )}
    />
  );
});

FormInputCheckBox.displayName = 'FormInputCheckBox';
