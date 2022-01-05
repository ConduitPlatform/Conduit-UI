import Editor from 'react-simple-code-editor';
import React, { FC, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { highlight, languages } from 'prismjs';

import 'prismjs/components/prism-json';
import 'prismjs/components/prism-clike';
import 'prismjs/themes/prism-dark.css';

const useStyles = makeStyles(() => ({
  editor: {
    minHeight: 300,
    width: '100%',
    backgroundColor: 'rgb(40 40 40)',
  },
}));

interface Props {
  value: any;
  disabled?: boolean;
}

const BSONEditor: FC<Props> = ({ value, disabled }) => {
  const classes = useStyles();

  const [stringValue, setStringValue] = useState('');

  useEffect(() => {
    if (value) setStringValue(JSON.stringify(value));
  }, [value]);

  const onValueChange = (editorValue: string) => {
    setStringValue(editorValue);
  };

  return (
    <Editor
      className={classes.editor}
      disabled={disabled}
      value={stringValue}
      onValueChange={(editorValue) => onValueChange(editorValue)}
      highlight={(editorValue) => highlight(editorValue, languages['json'], 'json')}
      padding={10}
    />
  );
};

export default BSONEditor;
