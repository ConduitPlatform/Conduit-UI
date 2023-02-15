import React from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { localeEn } from '../../models/JSONEditorAjrmLocale';
import { useTheme } from '@mui/material';

export interface JsonEditorComponentProps {
  id?: string | undefined;
  placeholder?: any;
  reset?: boolean | undefined;
  viewOnly?: boolean | undefined;
  onChange?: any;
  onBlur?: any;
  confirmGood?: boolean | undefined;
  height?: string | undefined;
  width?: string | undefined;
}
const JsonEditorComponent = React.forwardRef<
  JSONInput,
  React.PropsWithChildren<JsonEditorComponentProps>
>((props, ref) => {
  const theme = useTheme();

  return (
    <JSONInput
      ref={ref}
      key={`jsonInput-${theme.palette.mode}`}
      locale={localeEn}
      colors={{
        default:
          theme.palette.mode === 'dark' ? theme.palette.grey['300'] : theme.palette.grey['600'],
        background: theme.palette.background.paper,
        background_warning: theme.palette.background.paper,
        keys:
          theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
        keys_whiteSpace:
          theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
        colon:
          theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.light,
        primitive: theme.palette.primary.dark,
        number:
          theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark,
        string:
          theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
      }}
      {...props}
    />
  );
});

JsonEditorComponent.displayName = 'JsonEditorComponent';

export default JsonEditorComponent;
