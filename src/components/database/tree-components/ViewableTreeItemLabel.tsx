import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { AccountTree } from '@material-ui/icons';
import { Typography } from '@material-ui/core';

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

interface Document {
  id: string;
  data: any;
}

interface TreeItemLabelProps {
  document: Document;
  isRelation: boolean;
}

const ViewableTreeItemLabel: FC<TreeItemLabelProps> = ({ document, isRelation }) => {
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

export default ViewableTreeItemLabel;
