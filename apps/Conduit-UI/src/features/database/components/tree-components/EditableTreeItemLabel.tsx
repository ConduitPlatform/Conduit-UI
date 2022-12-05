import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { CustomDatepicker } from '@conduitplatform/ui-components';
import { Input, Typography } from '@mui/material';

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

interface Document {
  id: string;
  data: any;
}

interface TreeItemLabelProps {
  field: any;
  document: Document;
  onChange: (value: string) => void;
}

const EditableTreeItemLabel: FC<TreeItemLabelProps> = ({ field, document, onChange }) => {
  const classes = useStyles();

  const handleEditContent = () => {
    const isInputDisabled =
      document.id === 'createdAt' || document.id === 'updatedAt' || document.id === '_id';

    if (field?.enum) {
      return (
        <TextField
          select
          label=""
          value={document.data}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          classes={{
            root: classes.muiSelect,
          }}
          variant="outlined">
          <MenuItem value={''}>None</MenuItem>
          {field.enum.map((option: string, index: number) => (
            <MenuItem value={option} key={index}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    switch (field?.type) {
      case 'Boolean':
        return (
          <TextField
            select
            label=""
            value={document.data}
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
            required={field?.required}
            disabled={isInputDisabled}
            value={document.data}
            setValue={(event) => {
              if (event) onChange(event.toISOString());
            }}
          />
        );
      default:
        return (
          <Input
            disabled={isInputDisabled}
            sx={{ fontSize: '14px' }}
            autoComplete="new-password"
            value={document.data}
            onChange={(event) => onChange(event.target.value)}
            fullWidth
            classes={{
              input: classes.textInputProps,
            }}
            type={field?.type === 'Number' ? 'number' : 'text'}
            required={field?.required}
          />
        );
    }
  };

  return (
    <Typography
      variant={'subtitle2'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 0.25,
        minHeight: 28,
      }}>
      <Typography
        component={'span'}
        sx={{ marginRight: 1, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        {`${document.id}: `}
      </Typography>
      {handleEditContent()}
    </Typography>
  );
};

export default EditableTreeItemLabel;
