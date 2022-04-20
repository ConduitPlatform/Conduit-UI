import React, { FC } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { CustomDatepicker } from '@conduitplatform/ui-components';
import { Box, IconButton, Input, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { DeleteForeverRounded } from '@mui/icons-material';
import RelationSelectInput from './RelationSelectInput';

const useStyles = makeStyles((theme) => ({
  textInputProps: {
    padding: theme.spacing(0.25, 0),
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
          required={required}
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
      case 'Relation': {
        return (
          <RelationSelectInput
            required={required}
            schemaModel={schemaDoc.data.model}
            value={value}
            onChange={(val) => {
              onChange(val);
            }}
          />
        );
      }
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
            sx={{ fontSize: '14px' }}
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 0.25,
        minHeight: 28,
      }}>
      {required && (
        <Typography component="span" variant="body2" sx={{ mr: 0.25 }}>
          {'*'}
        </Typography>
      )}
      {isArrayElement && handleArrayFunctions()}
      <Typography component="span" sx={{ mr: 1, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        {schemaDoc.name}
        {schemaDoc.data.type === 'Relation' && `( ${schemaDoc.data.model} )`}:
      </Typography>
      {!isObject && handleLabelContent()}
    </Box>
  );
};
export default InputCreateTreeLabel;
