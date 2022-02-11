import React, { FC } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CustomDatepicker from '../../../common/CustomDatepicker';
import { Box, IconButton, Input, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DeleteForeverRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 0),
    minHeight: 28,
  },
  bold: {
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  textInput: {
    fontSize: '14px',
  },
  textInputProps: {
    padding: theme.spacing(0.25, 0),
  },
  asterisk: {
    marginRight: theme.spacing(0.25),
  },
  muiSelect: {
    padding: 0,
    '& .MuiSelect-outlined': {
      padding: theme.spacing(1, 5, 1, 1),
    },
  },
}));

type InputCreateTreeLabelProps = {
  schemaDoc: any;
  onChange: (val: any) => void;
  value?: string;
  isArrayElement?: boolean;
  onDeleteElement?: () => void;
  isObject?: boolean;
};
const InputCreateTreeLabel: FC<InputCreateTreeLabelProps> = ({
  isArrayElement = false,
  isObject = false,
  onDeleteElement,
  value,
  schemaDoc,
  onChange,
}) => {
  const classes = useStyles();
  const required = schemaDoc.data.required;
  const handleLabelContent = () => {
    if (schemaDoc.data.enum) {
      return (
        <TextField
          select
          label=""
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          classes={{
            root: classes.muiSelect,
          }}
          variant="outlined">
          <MenuItem value={''}>None</MenuItem>
          {schemaDoc.data.enum.map((option: string, index: number) => (
            <MenuItem value={option} key={index}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    switch (schemaDoc.data.type) {
      case 'Boolean':
        return (
          <TextField
            select
            label=""
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            classes={{
              root: classes.muiSelect,
            }}
            variant="outlined">
            <MenuItem value={''}>None</MenuItem>
            <MenuItem value={'true'}>True</MenuItem>
            <MenuItem value={'false'}>False</MenuItem>
          </TextField>
        );
      case 'Date':
        return (
          <CustomDatepicker
            required={required}
            value={value}
            setValue={(event) => {
              if (event) onChange(event.toISOString());
            }}
          />
        );
      default:
        return (
          <Input
            className={classes.textInput}
            autoComplete="new-password"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            fullWidth
            classes={{
              input: classes.textInputProps,
            }}
            type={schemaDoc?.data?.type === 'Number' ? 'number' : 'text'}
            required={required}
          />
        );
    }
  };

  const handleArrayFunctions = () => {
    if (onDeleteElement)
      return (
        <IconButton
          size={'small'}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteElement();
          }}>
          <DeleteForeverRounded />
        </IconButton>
      );
  };

  return (
    <Box className={classes.root}>
      {required && (
        <Typography component="span" variant="body2" className={classes.asterisk}>
          {'*'}
        </Typography>
      )}
      {isArrayElement && handleArrayFunctions()}
      <Typography component="span" className={classes.bold}>
        {schemaDoc.name}
        {schemaDoc.data.type === 'Relation' && `( ${schemaDoc.data.model} )`}:
      </Typography>
      {!isObject && handleLabelContent()}
    </Box>
  );
};
export default InputCreateTreeLabel;
