import React, { FC } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextField/TextField';

interface FormInputTextProps {
  name: string;
  label?: string;
  rows?: number;
  disabled?: boolean;
  typeOfInput?: string;
  rules?: ControllerProps['rules'];
  textFieldProps?: TextFieldProps;
}

export const FormInputText: FC<FormInputTextProps> = ({
  name,
  label,
  rows,
  disabled,
  typeOfInput,
  rules,
  textFieldProps,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          multiline={rows !== undefined}
          rows={rows}
          disabled={disabled}
          type={typeOfInput}
          helperText={errors[name] ? errors[name].message : null}
          error={!!errors[name]}
          fullWidth
          label={label}
          variant="outlined"
          {...textFieldProps}
        />
      )}
    />
  );
};
