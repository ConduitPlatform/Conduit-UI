import React, { FC } from 'react';
import { Input, Typography } from '@material-ui/core';
import { AccountTree } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 0),
  },
  bold: {
    fontWeight: 'bold',
  },
  textInput: {
    // padding: 0,
    fontSize: '14px',
  },
  textInputProps: {
    padding: theme.spacing(0.25, 0),
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
}

const TreeItemLabel: FC<TreeItemLabelProps> = ({ document, isRelation, edit }) => {
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
          onChange={(event) => console.log(event.target.value)}
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
