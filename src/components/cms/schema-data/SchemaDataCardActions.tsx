import React, { FC } from 'react';
import { Box, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { DeleteOutline, EditOutlined, KeyboardArrowDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { BoxProps } from '@material-ui/core/Box/Box';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    background: theme.palette.grey[600],
    borderRadius: theme.spacing(0.5),
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
  actionButton: {
    height: theme.spacing(2.75),
    width: theme.spacing(2.75),
  },
  editRoot: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(2),
  },
}));

interface ExpandableArrowProps extends BoxProps {
  expandable: string[];
  handleExpandAll: () => void;
}

export const ExpandableArrow: FC<ExpandableArrowProps> = ({
  expandable,
  handleExpandAll,
  ...rest
}) => {
  const classes = useStyles();
  if (expandable.length < 1) return <></>;

  return (
    <Box {...rest}>
      <Box className={classes.buttonContainer} onClick={() => handleExpandAll()}>
        <KeyboardArrowDown />
      </Box>
    </Box>
  );
};

interface DocumentActionsProps extends BoxProps {
  onEdit: () => void;
  onDelete: () => void;
  edit: boolean;
}

export const DocumentActions: FC<DocumentActionsProps> = ({ onEdit, onDelete, edit, ...rest }) => {
  const classes = useStyles();
  if (edit) return <></>;
  return (
    <Box {...rest}>
      <Tooltip title="Edit document">
        <Box
          className={clsx(classes.buttonContainer, classes.marginRight)}
          onClick={() => onEdit()}>
          <EditOutlined className={classes.actionButton} />
        </Box>
      </Tooltip>
      <Tooltip title="Delete document">
        <Box className={classes.buttonContainer} onClick={() => onDelete()}>
          <DeleteOutline className={classes.actionButton} />
        </Box>
      </Tooltip>
    </Box>
  );
};

interface EditDocumentActionsProps extends BoxProps {
  handleCancel: () => void;
  handleSave: () => void;
  edit: boolean;
}

export const EditDocumentActions: FC<EditDocumentActionsProps> = ({
  handleCancel,
  handleSave,
  edit,
  ...rest
}) => {
  const classes = useStyles();
  if (!edit) return <></>;
  return (
    <Box className={classes.editRoot} {...rest}>
      <Button variant={'contained'} className={classes.marginRight} onClick={handleCancel}>
        Cancel
      </Button>
      <Button color="primary" variant={'contained'} onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};
