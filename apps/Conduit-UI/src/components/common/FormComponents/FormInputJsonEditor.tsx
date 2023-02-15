import React, { forwardRef } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import JsonEditorComponent, { JsonEditorComponentProps } from '../JsonEditorComponent';
import { Box, InputLabel } from '@mui/material';

interface FormInputTextProps {
  name: string;
  label?: string;
  disabled?: boolean;
  rules?: ControllerProps['rules'];
  jsonEditorProps?: JsonEditorComponentProps;
}

const FormInputJsonEditor = forwardRef((props: FormInputTextProps) => {
  const { name, label, disabled, rules, jsonEditorProps } = props;

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
        <Box
          sx={{
            borderRadius: '10px',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgba(255, 255, 255, 0.23)',
            padding: '16.5px 14px',
          }}>
          <InputLabel
            shrink={!field.value || JSON.stringify(field.value) !== '{}'}
            error={errors[field.name]}
            htmlFor="component-simple">
            {label}
          </InputLabel>
          <JsonEditorComponent
            id={field.name}
            ref={field.ref}
            onChange={(value: any) => field.onChange(value.jsObject)}
            onBlur={field.onBlur}
            placeholder={field.value}
            viewOnly={disabled}
            {...jsonEditorProps}
          />
        </Box>
      )}
    />
  );
});

FormInputJsonEditor.displayName = 'FormInputText';

export default FormInputJsonEditor;
