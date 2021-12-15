import React, { FC } from 'react';
import { Input, Typography } from '@material-ui/core';
import { AccountTree } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import CustomDatepicker from '../../common/CustomDatepicker';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 0),
    minHeight: 42,
  },
  bold: {
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

interface Document {
  id: string;
  data: any;
}

interface TreeItemLabelProps {
  document: Document;
  isRelation: boolean;
  edit: boolean;
  onChange: (value: string) => void;
}

const TreeItemLabel: FC<TreeItemLabelProps> = ({ document, isRelation, edit, onChange }) => {
  const classes = useStyles();

  const handleLabelContent = () => {
    const isArray = Array.isArray(document.data);
    const isObject =
      typeof document.data !== 'string' && document.data && Object.keys(document.data).length > 0;
    if (isArray) {
      if (document.data.length > 0) {
        return '[...]';
      }
      return '[ ]';
    }
    if (isObject) {
      return '{...}';
    }
    if (isRelation) {
      return <AccountTree color="primary" />;
    }
    if (edit) {
      return (
        <Input
          className={classes.textInput}
          autoComplete="new-password"
          value={document.data}
          onChange={(event) => onChange(event.target.value)}
          fullWidth
          classes={{
            input: classes.textInputProps,
          }}
        />
      );
    }
    return `${document.data}`;
  };

  return (
    <Typography variant={'subtitle2'} className={classes.root}>
      <Typography component={'span'} className={classes.bold}>
        {`${document.id}: `}
      </Typography>
      {handleLabelContent()}
    </Typography>
  );
};

export default TreeItemLabel;

interface CreateTreeItemLabelProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  edit: boolean;
  required: boolean;
}

export const CreateTreeItemLabel: FC<CreateTreeItemLabelProps> = ({
  field,
  value,
  onChange,
  edit,
  required,
}) => {
  const classes = useStyles();

  const handleLabelContent = () => {
    if (field.data.enum) {
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
          {field.data.enum.map((option: string, index: number) => (
            <MenuItem value={option} key={index}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    switch (field.data.type) {
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
            required={required}
          />
        );
    }
  };

  return (
    <Typography variant={'subtitle2'} className={classes.root}>
      {required && (
        <Typography component="span" variant="body2" className={classes.asterisk}>
          {'*'}
        </Typography>
      )}
      <Typography component="span" className={classes.bold}>
        {field.name}
        {field.data.type === 'Relation' ? `( ${field.data.model} )` : ''}:
      </Typography>
      {edit && handleLabelContent()}
    </Typography>
  );
};
