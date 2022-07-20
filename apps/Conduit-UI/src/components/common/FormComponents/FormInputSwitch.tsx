import React, { forwardRef } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import { Switch, SwitchProps } from '@mui/material';

interface FormSwitchProps {
  name: string;
  disabled?: boolean;
  rules?: ControllerProps['rules'];
  switchProps?: SwitchProps;
}

export const FormInputSwitch = forwardRef((props: FormSwitchProps, ref) => {
  const { name, disabled, rules, switchProps } = props;
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field }) => (
        <Switch
          {...field}
          inputRef={ref}
          checked={field.value}
          color="primary"
          disabled={disabled}
          {...switchProps}
        />
      )}
    />
  );
});

FormInputSwitch.displayName = 'FormInputSwitch';
