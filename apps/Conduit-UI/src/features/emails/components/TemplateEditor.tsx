import Editor from 'react-simple-code-editor';
import React, { FC } from 'react';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-handlebars';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-clike';
import 'prismjs/themes/prism-dark.css';
import { styled } from '@mui/material';

const CustomizedEditor = styled(Editor)(({ theme }) => ({
  minHeight: 300,
  width: '100%',
  backgroundColor: theme.palette.background.default,
}));

interface Props {
  value: string;
  setValue?: (value: string) => void;
  disabled?: boolean;
}

const TemplateEditor: FC<Props> = ({ value, setValue, disabled }) => {
  const onValueChange = (editorValue: string) => {
    if (setValue) {
      setValue(editorValue);
    }
  };

  return (
    <CustomizedEditor
      disabled={disabled}
      value={value}
      onValueChange={(editorValue) => onValueChange(editorValue)}
      highlight={(editorValue) => highlight(editorValue, languages['handlebars'], 'handlebars')}
      padding={10}
    />
  );
};

export default TemplateEditor;
