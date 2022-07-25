import React, { forwardRef } from 'react';
import { MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import { TextFieldProps } from '@mui/material/TextField/TextField';

interface FormSelectProps {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  rules?: ControllerProps['rules'];
  textFieldProps?: TextFieldProps;
}

export const FormInputSelect = forwardRef((props: FormSelectProps, ref) => {
  const { name, label, options, disabled, rules, textFieldProps } = props;
  const generateSingleOptions = () => {
    return options.map((option: { label: string; value: string }) => {
      return (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      );
    });
  };

  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      rules={rules}
      control={control}
      name={name}
      render={({ field }) => (
        <TextField
          {...field}
          select
          fullWidth
          disabled={disabled}
          helperText={errors[name] ? errors[name].message : null}
          error={!!errors[name]}
          label={label}
          variant="outlined"
          {...textFieldProps}>
          {generateSingleOptions()}
        </TextField>
      )}
    />
  );
});

FormInputSelect.displayName = 'FormInputSelect';
